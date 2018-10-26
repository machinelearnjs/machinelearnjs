import * as tf from '@tensorflow/tfjs';
import { cloneDeep, range } from 'lodash';
import * as Random from 'random-js';
import math from '../utils/MathExtra';

/**
 * L1 grad method
 * @param alpha
 * @param w
 */
/*
const l1Grad = (alpha: number, w: number[]) => {
  const tAlpha = tf.tensor(alpha);
  const tW = tf.tensor(w);
  return tAlpha.mul(tW);
}*/

/**
 * Ordinary base class for SGD classier or regressor
 * @ignore
 */
class BaseSGD {
  private learningRate = null;
  private epochs = null;
  private coefficients = [];
  private clone = true;
  private w = null;
  private randomEngine = null;
  /**
   * @param preprocess - preprocess methodology can be either minmax or null. Default is minmax.
   * @param learning_rate - Used to limit the amount each coefficient is corrected each time it is updated.
   * @param epochs - Number of iterations.
   * @param clone - To clone the passed in dataset.
   */
  constructor(
    {
      learning_rate = 0.0001,
      epochs = 10000,
      clone = true
    }: {
      learning_rate?: number;
      epochs?: number;
      clone?: boolean;
    } = {
      learning_rate: 0.0001,
      epochs: 10000,
      clone: true
    }
  ) {
    this.learningRate = learning_rate;
    this.epochs = epochs;
    this.clone = clone;

    // Random Engine
    this.randomEngine = Random.engines.mt19937().autoSeed();
  }

  /**
   * Train the base SGD
   * @param X - Matrix of data
   * @param y - Matrix of targets
   */
  public fit(
    {
      X = null,
      y = null
    }: {
      X: number[][];
      y: number[];
    } = {
      X: null,
      y: null
    }
  ): void {
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
    this.sgd({ X: clonedX, y: clonedY });
  }

  /**
   * Save the model's checkpoint
   */
  public toJSON(): {
    /**
     * coefficient values
     */
    coefficients: number[];
  } {
    return {
      coefficients: this.coefficients
    };
  }

  /**
   * Restore the model from a checkpoint
   * @param coefficients - coefficient values
   * @param scaler - scaler object such as MinMaxScaler
   */
  public fromJSON(
    {
      coefficients = []
    }: {
      coefficients: number[];
    } = {
      coefficients: []
    }
  ): void {
    this.coefficients = coefficients;
  }

  /**
   * Predictions according to the passed in test set
   * @param X - Matrix of data
   */
  protected predict({ X }): number[] {
    if (!Array.isArray(X)) {
      throw Error('X must be a vector');
    }
    // Adding bias
    const biasX: number[][] = this.addBias(X);
    const tensorX = tf.tensor(biasX);
    const yPred = tensorX.dot(this.w);
    return [...yPred.dataSync()];
  }

  /**
   * Initialize weights based on the number of features
   *
   * @example
   * initializeWeights(3);
   * // this.w = [-0.213981293, 0.12938219, 0.34875439]
   *
   * @param nFeatures
   */
  private initializeWeights(nFeatures: number): void {
    const limit = 1 / Math.sqrt(nFeatures);
    const distribution = Random.real(-limit, limit);
    const getRand = () => distribution(this.randomEngine);
    this.w = tf.tensor1d(range(0, nFeatures).map(() => getRand()));
  }

  /**
   * Adding bias to a given array
   *
   * @example
   * addBias([[1, 2], [3, 4]], 1);
   * // [[1, 1, 2], [1, 3, 4]]
   *
   * @param X
   * @param bias
   */
  private addBias(X, bias = 1): number[][] {
    // TODO: Is there a TF way to achieve it?
    return X.reduce((sum, cur) => {
      sum.push([bias].concat(cur));
      return sum;
    }, []);
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

    const tensorX = tf.tensor2d(this.addBias(X));

    this.initializeWeights(tensorX.shape[1]);
    // const tensorX = tf.tensor2d(X);
    const tensorY = tf.tensor1d(y);
    const tensorLR = tf.tensor(this.learningRate);
    for (let e = 0; e < this.epochs; e++) {
      const yPred = tensorX.dot(this.w);
      const gradW = tensorY
        .sub(yPred)
        .neg()
        .dot(tensorX)
        .add(tf.regularizers.l2().apply(this.w));
      this.w = this.w.sub(tensorLR.mul(gradW));
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
    return results.map(x => Math.round(x));
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
