import * as tf from '@tensorflow/tfjs';
import { cloneDeep, range } from 'lodash';
import * as Random from 'random-js';
import { validateFitInputs, validateMatrix2D } from '../ops';
import { IMlModel, Type1DMatrix, Type2DMatrix } from '../types';

export enum TypeLoss {
  L1 = 'L1',
  L2 = 'L2',
  L1L2 = 'L1L2'
}

/**
 * Type for L1L2 regularizer factors
 */
export interface TypeRegFactor {
  l1?: number;
  l2?: number;
}

/**
 * Ordinary base class for SGD classier or regressor
 * @ignore
 */
export class BaseSGD implements IMlModel<number> {
  protected learningRate: number;
  protected epochs: number;
  protected loss;
  protected regFactor: TypeRegFactor;
  private clone: boolean = true;
  private weights: tf.Tensor<tf.Rank.R1> = null;
  private randomEngine: Random.MT19937; // Random engine used to
  private randomState: number;
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
      clone = true,
      random_state = null,
      loss = TypeLoss.L2,
      reg_factor = null
    }: {
      learning_rate?: number;
      epochs?: number;
      clone?: boolean;
      random_state?: number;
      loss?: string;
      reg_factor?: TypeRegFactor;
    } = {
      learning_rate: 0.0001,
      epochs: 10000,
      clone: true,
      random_state: null,
      loss: TypeLoss.L2,
      reg_factor: null
    }
  ) {
    this.learningRate = learning_rate;
    this.epochs = epochs;
    this.clone = clone;
    this.randomState = random_state;
    this.loss = loss;
    this.regFactor = reg_factor;

    // Setting a loss function according to the input option
    if (this.loss === TypeLoss.L1 && this.regFactor) {
      this.loss = tf.regularizers.l1({
        l1: this.regFactor.l1
      });
    } else if (this.loss === TypeLoss.L1L2 && this.regFactor) {
      this.loss = tf.regularizers.l1l2({
        l1: this.regFactor.l1,
        l2: this.regFactor.l2
      });
    } else if (this.loss === TypeLoss.L2 && this.regFactor) {
      this.loss = tf.regularizers.l2({
        l2: this.regFactor.l2
      });
    } else {
      this.loss = tf.regularizers.l2();
    }

    // Random Engine
    if (Number.isInteger(this.randomState)) {
      this.randomEngine = Random.engines.mt19937().seed(this.randomState);
    } else {
      this.randomEngine = Random.engines.mt19937().autoSeed();
    }
  }

  /**
   * Train the base SGD
   * @param X - Matrix of data
   * @param y - Matrix of targets
   */
  public fit(
    X: Type2DMatrix<number> = null,
    y: Type1DMatrix<number> = null
  ): void {
    validateFitInputs(X, y);

    // holds all the preprocessed X values
    // Clone according to the clone flag
    const clonedX = this.clone ? cloneDeep(X) : X;
    const clonedY = this.clone ? cloneDeep(y) : y;
    this.sgd(clonedX, clonedY);
  }

  /**
   * Save the model's checkpoint
   */
  public toJSON(): {
    /**
     * model learning rate
     */
    learning_rate: number;
    /**
     * model training epochs
     */
    epochs: number;
    /**
     * Model training weights
     */
    weights: number[];
    /**
     * Number used to set a static random state
     */
    random_state: number;
  } {
    return {
      learning_rate: this.learningRate,
      epochs: this.epochs,
      weights: [...this.weights.dataSync()],
      random_state: this.randomState
    };
  }

  /**
   * Restore the model from a checkpoint
   * @param learning_rate - Training learning rate
   * @param epochs - Number of model's training epochs
   * @param weights - Model's training state
   * @param random_state - Static random state for the model initialization
   */
  public fromJSON(
    {
      learning_rate = 0.0001,
      epochs = 10000,
      weights = [],
      random_state = null
    }: {
      learning_rate: number;
      epochs: number;
      weights: number[];
      random_state: number;
    } = {
      learning_rate: 0.0001,
      epochs: 10000,
      weights: [],
      random_state: null
    }
  ): void {
    this.learningRate = learning_rate;
    this.epochs = epochs;
    this.weights = tf.tensor(weights);
    this.randomState = random_state;
  }

  /**
   * Predictions according to the passed in test set
   * @param X - Matrix of data
   */
  public predict(X: Type2DMatrix<number> = null): number[] {
    validateMatrix2D(X);
    // Adding bias
    const biasX: number[][] = this.addBias(X);
    const tensorX = tf.tensor(biasX);
    const yPred = tensorX.dot(this.weights);
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
    this.weights = tf.tensor1d(range(0, nFeatures).map(() => getRand()));
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
  private sgd(X: Type2DMatrix<number>, y: Type1DMatrix<number>): void {
    const tensorX = tf.tensor2d(this.addBias(X));

    this.initializeWeights(tensorX.shape[1]);
    const tensorY = tf.tensor1d(y);
    const tensorLR = tf.tensor(this.learningRate);
    for (let e = 0; e < this.epochs; e++) {
      const yPred = tensorX.dot(this.weights);
      const gradW = tensorY
        .sub(yPred)
        .neg()
        .dot(tensorX)
        .add(this.loss.apply(this.weights));
      this.weights = this.weights.sub(tensorLR.mul(gradW));
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
 * import { SGDClassifier } from 'machinelearn/linear_model';
 * const clf = new SGDClassifier();
 * const X = [[0., 0.], [1., 1.]];
 * const y = [0, 1];
 * clf.fit(X ,y);
 * clf.predict([[2., 2.]]); // result: [ 1 ]
 *
 */
export class SGDClassifier extends BaseSGD {
  /**
   * Predicted values with Math.round applied
   * @param X - Matrix of data
   */
  public predict(X: Type2DMatrix<number> = null): number[] {
    const results: number[] = super.predict(X);
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
 * import { SGDRegressor } from 'machinelearn/linear_model';
 * const reg = new SGDRegressor();
 * const X = [[0., 0.], [1., 1.]];
 * const y = [0, 1];
 * reg.fit(X, y);
 * reg.predict([[2., 2.]]); // result: [ 1.281828588248001 ]
 *
 */
export class SGDRegressor extends BaseSGD {
  /**
   * Predicted values
   * @param X - Matrix of data
   */
  public predict(X: Type2DMatrix<number> = null): number[] {
    return super.predict(X);
  }
}
