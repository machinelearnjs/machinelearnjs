import { cloneDeep, fill } from 'lodash';
import { MinMaxScaler } from '../preprocessing';
import math from '../utils/MathExtra';

/**
 * Ordinary base class for SGD classier or regressor
 * @ignore
 */
class BaseSGD {
  protected scaler = null;
  private preprocess = null;
  private learningRate = null;
  private epochs = null;
  private coefficients = [];
  private clone = true;
  /**
   * @param preprocess - preprocess methodology can be either minmax or null. Default is minmax.
   * @param learning_rate - Used to limit the amount each coefficient is corrected each time it is updated.
   * @param epochs - Number of iterations.
   * @param clone - To clone the passed in dataset.
   */
  constructor(
    {
      preprocess = 'minmax',
      learning_rate = 0.01,
      epochs = 50,
      clone = true
    }: {
      preprocess?: string;
      learning_rate?: number;
      epochs?: number;
      clone?: boolean;
    } = {
      preprocess: 'minmax',
      learning_rate: 0.001,
      epochs: 50,
      clone: true
    }
  ) {
    this.preprocess = preprocess;
    this.learningRate = learning_rate;
    this.epochs = epochs;
    this.clone = clone;
  }

  /**
   * Train the base SGD
   * @param X - Matrix of data
   * @param y - Matrix of targets
   */
  public fit({
    X = null,
    y = null,
  }: {
    X: number[][],
    y: number[],
  } = {
    X: null,
    y: null,
  }): void {
    if (!math.contrib.isMatrix(X)) {
      throw Error('X must be a matrix');
    }

    if (!Array.isArray(y)) {
      throw Error('y must be a vector');
    }
    // holds all the preprocessed X values
    // Clone according to the clone flag
    const clonedX = this.clone ? cloneDeep(X) : X;
    const clonedY = this.clone ? cloneDeep(y) : y;
    const dataset = [];

    // processed data
    let processedX = [];
    let processedY = [];
    for (let i = 0; i < clonedX.length; i++) {
      dataset.push(clonedX[i].concat(clonedY[i]));
    }
    if (this.preprocess === 'minmax') {
      // Applying MinMax scaling on X
      // todo: should we minmax scale including the target val?
      this.scaler = new MinMaxScaler({ featureRange: [0, 1] });
      this.scaler.fit(dataset);
      for (let i = 0; i < clonedX.length; i++) {
        const currentRow = dataset[i];
        const scaledRow = this.scaler.fit_transform(currentRow);
        const scaledTarget = scaledRow.pop();
        processedX.push(scaledRow);
        processedY.push(scaledTarget);
      }
    } else {
      // rebinding the original value since "preprocess" was not specified
      processedX = clonedX;
      processedY = clonedY;
    }
    this.sgd({ X: processedX, y: processedY });
  }

  /**
   * Save the model's checkpoint
   */
  public toJSON(): {
    /**
     * coefficient values
     */
    coefficients: number[];
    /**
     * scaler object such as MinMaxScaler
     */
    scaler: {};
  } {
    return {
      coefficients: this.coefficients,
      scaler: this.scaler
    }
  }

  /**
   * Restore the model from a checkpoint
   * @param coefficients - coefficient values
   * @param scaler - scaler object such as MinMaxScaler
   */
  public fromJSON({
    coefficients = [],
    scaler = null,
  }: {
    coefficients: number[];
    scaler: {};
  } = {
    coefficients: [],
    scaler: null,
  }): void {
    this.coefficients = coefficients;
    this.scaler = scaler;
  }

  /**
   * Predictions according to the passed in test set
   * @param X - Matrix of data
   */
  protected predict({ X }): number[] {
    if (!Array.isArray(X)) {
      throw Error('X must be a vector');
    }

    const predictions = [];
    const clonedX = this.clone ? cloneDeep(X) : X;
    const scaledX = clonedX.map(z => this.scaler.fit_transform(z));
    for (let i = 0; i < scaledX.length; i++) {
      const row = scaledX[i];
      predictions.push(this.predictOne({ row }));
    }
    // Resulting classes with min max inverse transformed
    return predictions;
  }

  /**
   * Calculate yhat of a row in the dataset
   * @param row
   * @param coefficients
   */
  private predictOne({ row }): number {
    let yhat = this.coefficients[0];
    for (let i = 0; i < row.length; i++) {
      yhat += this.coefficients[i + 1] * row[i];
    }
    return yhat;
  }
  /**
   * SGD based on linear model to calculate coefficient
   * @param X - training data
   * @param y - target data
   */
  private sgd(
    {
      X = null,
      y = null
    }: {
      X: any[][];
      y: any[];
    } = {
      X: null,
      y: null
    }
  ): void {
    if (!math.contrib.isMatrix(X) || !Array.isArray(y)) {
      throw Error('X must be a matrix');
    }
    const numFeatures = X[0].length;
    this.coefficients = fill(Array(numFeatures + 1), 0.0);
    for (let e = 0; e < this.epochs; e++) {
      for (let rowIndex = 0; rowIndex < X.length; rowIndex++) {
        const row = X[rowIndex];
        const yhat = this.predictOne({ row });
        const error = yhat - y[rowIndex];
        // Minimising the error
        // b = b - learning_rate * error * x
        this.coefficients[0] = this.coefficients[0] - this.learningRate * error;
        for (let j = 0; j < numFeatures; j++) {
          this.coefficients[j + 1] = this.coefficients[j + 1] - this.learningRate * error * row[j];
        }
      }
    }
  }
}

/**
 * Linear classifiers (SVM, logistic regression, a.o.) with SGD training.
 *
 * This estimator implements regularized linear models with
 * stochastic gradient descent (SGD) learning: the gradient of
 * the loss is estimated each sample at a time and the model is
 * updated along the way with a decreasing strength schedule
 * (aka learning rate). SGD allows minibatch (online/out-of-core)
 * learning, see the partial_fit method. For best results using
 * the default learning rate schedule, the data should have zero mean
 * and unit variance.
 *
 * @example
 * import { SGDClassifier } from 'kalimdor/linear_model';
 * const clf = new SGDClassifier();
 * const X = [[0., 0.], [1., 1.]];
 * const y = [0, 1];
 * clf.fit({ X, y });
 * clf.predict({ X: [[2., 2.]] }); // result: [ 1 ]
 *
 */
export class SGDClassifier extends BaseSGD {
  /**
   * Predicted values with Math.round applied
   * @param X - Matrix of data
   */
  public predict(
    {
      X = []
    }: {
      X: number[][];
    } = {
      X: []
    }
  ): number[] {
    const results: number[] = super.predict({ X });
    let processedResult = results;
    if (this.scaler) {
      processedResult = this.scaler.inverse_transform(results);
    }
    return processedResult.map(x => Math.round(x));
  }
}

/**
 * Linear model fitted by minimizing a regularized empirical loss with SGD
 * SGD stands for Stochastic Gradient Descent: the gradient of the loss
 * is estimated each sample at a time and the model is updated along
 * the way with a decreasing strength schedule (aka learning rate).
 *
 * @example
 * import { SGDRegressor } from 'kalimdor/linear_model';
 * const reg = new SGDRegressor();
 * const X = [[0., 0.], [1., 1.]];
 * const y = [0, 1];
 * reg.fit({ X, y });
 * reg.predict({ X: [[2., 2.]] }); // result: [ 1.281828588248001 ]
 *
 */
export class SGDRegressor extends BaseSGD {
  /**
   * Predicted values
   * @param X - Matrix of data
   */
  public predict(
    {
      X = []
    }: {
      X: number[][];
    } = {
      X: []
    }
  ): number[] {
    return super.predict({ X });
  }
}
