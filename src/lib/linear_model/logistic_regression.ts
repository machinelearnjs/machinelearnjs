import * as tf from '@tensorflow/tfjs';
import { Type1DMatrix, Type2DMatrix } from '../types';
import { ensure2DMatrix, inferShape } from '../utils/tensors';
import { validateFeaturesConsistency, validateFitInputs } from '../utils/validation';

/**
 * Logistic Regression (aka logit, MaxEnt) classifier.
 */
export class LogisticRegression {
  private weights: tf.Tensor1D;
  private learningRate: number;

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
  public fit(X: Type2DMatrix<number> | Type1DMatrix<number>, y: Type1DMatrix<number>, numIterations = 4000): void {
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
  public predict(X: Type2DMatrix<number> | Type1DMatrix<number>): number[] {
    validateFeaturesConsistency(X, this.weights.arraySync());

    const xWrapped: Type2DMatrix<number> = ensure2DMatrix(X);

    return tf.round(tf.sigmoid(tf.tensor2d(xWrapped).dot(this.weights))).arraySync() as number[];
  }

  /**
   * Get the model details in JSON format
   */
  public toJSON(): {
    weights: number[];
    learningRate: number;
  } {
    return {
      weights: this.weights.arraySync(),
      learningRate: this.learningRate,
    };
  }

  /**
   * Restore the model from a checkpoint
   */
  public fromJSON({ weights, learningRate }: { weights: number[]; learningRate: number }): void {
    this.weights = tf.tensor1d(weights);
    this.learningRate = learningRate;
  }

  private initWeights(X: Type2DMatrix<number> | Type1DMatrix<number>): void {
    const shape: number[] = inferShape(X);
    const numFeatures: number = shape[1];
    const limit: number = 1 / Math.sqrt(numFeatures);
    this.weights = tf.randomUniform([numFeatures], -limit, limit);
  }
}
