import { mul, randomUniform, Rank, round, sigmoid, Tensor, Tensor1D, tensor1d, tensor2d } from '@tensorflow/tfjs';
import { Type1DMatrix, Type2DMatrix } from '../types';
import { ensure2DMatrix, inferShape } from '../utils/tensors';
import { checkNumFeatures, validateFitInputs } from '../utils/validation';

export class LogisticRegression {
  private weights: Tensor1D;
  private learningRate: number;

  constructor(
    {
      learning_rate = 0.1,
    }: {
      learning_rate: number;
    } = {
      learning_rate: 0.1,
    },
  ) {
    this.learningRate = learning_rate;
  }

  public fit(X: Type2DMatrix<number> | Type1DMatrix<number>, y: Type1DMatrix<number>, numIterations = 4000): void {
    const xWrapped: Type2DMatrix<number> = ensure2DMatrix(X);
    validateFitInputs(xWrapped, y);
    this.initWeights(xWrapped);
    const tensorX = tensor2d(xWrapped);
    const tensorY = tensor1d(y);

    for (let i = 0; i < numIterations; ++i) {
      const predictions: Tensor<Rank> = sigmoid(tensorX.dot(this.weights));

      const gradient: Tensor<Rank> = mul(tensorY.sub(predictions).dot(tensorX), -1);
      this.weights = this.weights.sub(mul(this.learningRate, gradient));
    }
  }

  public predict(X: Type2DMatrix<number> | Type1DMatrix<number>): number[] {
    checkNumFeatures(X, this.weights.arraySync());

    const xWrapped: Type2DMatrix<number> = ensure2DMatrix(X);

    return round(sigmoid(tensor2d(xWrapped).dot(this.weights))).arraySync() as number[];
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
    this.weights = tensor1d(weights);
    this.learningRate = learningRate;
  }

  private initWeights(X: Type2DMatrix<number> | Type1DMatrix<number>): void {
    const shape: number[] = inferShape(X);
    const numFeatures: number = shape[1];
    const limit: number = 1 / Math.sqrt(numFeatures);
    this.weights = randomUniform([numFeatures], -limit, limit);
  }
}
