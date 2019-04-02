import {
  mul,
  randomUniform,
  Rank,
  round,
  sigmoid,
  Tensor,
  Tensor1D,
  tensor1d,
  tensor2d
} from '@tensorflow/tfjs';
import { map } from 'lodash';
import { inferShape } from '../ops';
import { Type1DMatrix, Type2DMatrix } from '../types';

export class LogisticRegression {
  private params: Tensor1D;
  private learningRate: number;
  private gradientDescent: boolean;

  constructor(learningRate = 0.1, gradientDescent = true) {
    this.learningRate = learningRate;
    this.gradientDescent = gradientDescent;
  }

  public fit(
    X: Type2DMatrix<number> | Type1DMatrix<number>,
    y: Type1DMatrix<number>,
    numIterations = 4000
  ): void {
    const xWrapped: Type2DMatrix<number> = this.makeX2DMatrix(X);
    this.initParams(xWrapped);
    const tensorX = tensor2d(xWrapped);
    const tensorY = tensor1d(y);

    for (let i = 0; i < numIterations; ++i) {
      const predictions: Tensor<Rank> = sigmoid(tensorX.dot(this.params));

      if (this.gradientDescent) {
        const gradient: Tensor<Rank> = mul(
          tensorY.sub(predictions).dot(tensorX),
          -1
        );
        this.params = this.params.sub(mul(this.learningRate, gradient));
      }
    }
  }

  public predict(X: Type2DMatrix<number> | Type1DMatrix<number>): number[] {
    this.checkShape(X);

    const xWrapped: Type2DMatrix<number> = this.makeX2DMatrix(X);

    return Array.from(
      round(sigmoid(tensor2d(xWrapped).dot(this.params))).dataSync()
    );
  }

  private initParams(X: Type2DMatrix<number> | Type1DMatrix<number>): void {
    const shape: number[] = inferShape(X);
    const numFeatures: number = shape[1];
    const limit: number = 1 / Math.sqrt(numFeatures);
    this.params = randomUniform([numFeatures], -limit, limit);
  }

  private makeX2DMatrix(
    X: Type2DMatrix<number> | Type1DMatrix<number>
  ): Type2DMatrix<number> {
    const shape: number[] = inferShape(X);
    return shape.length === 2
      ? (X as Type2DMatrix<number>)
      : (map(X, x => [x]) as Type2DMatrix<number>);
  }

  private checkShape(X: Type2DMatrix<number> | Type1DMatrix<number>): void {
    const xShape: number[] = inferShape(X);
    const paramsShape: number[] = inferShape(
      Array.from(this.params.dataSync())
    );
    const xNumFeatures = xShape.length === 1 ? 1 : xShape[1];
    const modelNumFeatures = paramsShape[0];
    if (xNumFeatures !== modelNumFeatures) {
      throw new Error(
        `Provided X has incorrect number of features. Should have: ${modelNumFeatures}, got: ${xNumFeatures}`
      );
    }
  }
}
