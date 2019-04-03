import * as tf from '@tensorflow/tfjs';
import { Type1DMatrix, Type2DMatrix } from '../types';
import { ensure2DMatrix, inferShape } from '../utils/tensors';
import { checkNumFeatures, validateFitInputs } from '../utils/validation';

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
   * @param y - A matriix of targets
   * @param numIterations
   */
  public fit(X: Type2DMatrix<number> | Type1DMatrix<number>, y: Type1DMatrix<number>, numIterations = 4000): void {
    const xWrapped: Type2DMatrix<number> = ensure2DMatrix(X);
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
   */
  public predict(X: Type2DMatrix<number> | Type1DMatrix<number>): number[] {
    checkNumFeatures(X, this.weights.arraySync());

    const xWrapped: Type2DMatrix<number> = ensure2DMatrix(X);

    return tf.round(tf.sigmoid(tf.tensor2d(xWrapped).dot(this.weights))).arraySync() as number[];
  }

  public toJSON(): {
    weights: number[];
    learningRate: number;
  } {
    return {
      weights: this.weights.arraySync(),
      learningRate: this.learningRate,
    };
  }

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
