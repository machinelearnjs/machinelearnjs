import * as tf from '@tensorflow/tfjs';
import { Type1DMatrix, Type2DMatrix } from '../types';
import { ensure2DMatrix, inferShape } from '../utils/tensors';
import { validateFeaturesConsistency, validateFitInputs } from '../utils/validation';

/**
 * Logistic Regression (aka logit, MaxEnt) classifier.
 *
 *
 * Logistic regression is named for the function used at the core of the method, the logistic function.
 * The logistic function, also called the sigmoid function was developed by statisticians to describe properties of
 * population growth in ecology, rising quickly and maxing out at the carrying capacity of the environment.
 * It’s an S-shaped curve that can take any real-valued number and map it into a value between 0 and 1,
 * but never exactly at those limits.
 *
 * 1 / (1 + e^-value)
 *
 * @example
 * import { LogisticRegression } from 'machinelearn/linear_model';
 * import { HeartDisease } from 'machinelearn/datasets';
 *
 * (async function() {
 *   const { data, targets } = await heartDisease.load();
 *   const { xTest, xTrain, yTest } = train_test_split(data, targets);
 *
 *   const lr = new LogisticRegression();
 *   lr.fit(xTrain, yTrain);
 *
 *   lr.predict(yTest);
 * });
 *
 */
export class LogisticRegression {
  private weights: tf.Tensor1D;
  private learningRate: number;

  /**
   * @param learning_rate - Model learning rate
   */
  constructor(
    {
      learning_rate = 0.001,
    }: {
      learning_rate: number;
    } = {
      learning_rate: 0.001,
    },
  ) {
    this.learningRate = learning_rate;
  }

  /**
   * Fit the model according to the given training data.
   * @param X - A matrix of samples
   * @param y - A matrix of targets
   * @param numIterations - Number of iterations to run gradient descent for
   */
  public fit(
    X: Type2DMatrix<number> | Type1DMatrix<number> = null,
    y: Type1DMatrix<number> = null,
    numIterations = 4000,
  ): void {
    const xWrapped = ensure2DMatrix(X);
    validateFitInputs(xWrapped, y);
    this.initWeights(xWrapped);
    const tensorX = tf.tensor2d(xWrapped);
    const tensorY = tf.tensor1d(y);

    for (let i = 0; i < numIterations; ++i) {
      const predictions: tf.Tensor<tf.Rank> = tf.sigmoid(tensorX.dot(this.weights));

      const gradient: tf.Tensor<tf.Rank> = tf.mul(tensorY.sub(predictions).dot(tensorX), -1);
      this.weights = this.weights.sub(tf.mul(this.learningRate, gradient));
    }
  }

  /**
   * Predict class labels for samples in X.
   * @param X - A matrix of test data
   * @returns An array of predicted classes
   */
  public predict(X: Type2DMatrix<number> | Type1DMatrix<number> = null): number[] {
    validateFeaturesConsistency(X, this.weights.arraySync());

    const xWrapped: Type2DMatrix<number> = ensure2DMatrix(X);

    return tf.round(tf.sigmoid(tf.tensor2d(xWrapped).dot(this.weights))).arraySync() as number[];
  }

  /**
   * Get the model details in JSON format
   */
  public toJSON(): {
    /**
     * Model training weights
     */
    weights: number[];
    /**
     * Model learning rate
     */
    learning_rate: number;
  } {
    return {
      weights: this.weights.arraySync(),
      learning_rate: this.learningRate,
    };
  }

  /**
   * Restore the model from a checkpoint
   */
  public fromJSON(
    {
      /**
       * Model training weights
       */
      weights = null,
      /**
       * Model learning rate
       */
      learning_rate = null,
    }: {
      weights: number[];
      learning_rate: number;
    } = {
      weights: null,
      learning_rate: 0.001,
    },
  ): void {
    this.weights = tf.tensor1d(weights);
    this.learningRate = learning_rate;
  }

  private initWeights(X: Type2DMatrix<number> | Type1DMatrix<number>): void {
    const shape: number[] = inferShape(X);
    const numFeatures: number = shape[1];
    const limit: number = 1 / Math.sqrt(numFeatures);
    this.weights = tf.randomUniform([numFeatures], -limit, limit);
  }
}
