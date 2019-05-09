import { DecisionTreeClassifier } from '../tree';
import { Type1DMatrix, Type2DMatrix } from '../types';
import { ValidationError } from '../utils/Errors';
import math from '../utils/MathExtra';
import { ensure2DMatrix, inferShape } from '../utils/tensors';
import { validateFitInputs } from '../utils/validation';

export class BaggingClassifier {
  private baseEstimator: any;
  private numEstimators: number;
  private bootstrap: boolean;
  private options: any;
  private maxSamples: number;
  private estimators: any[] = [];

  constructor({
    baseEstimator = DecisionTreeClassifier,
    numEstimators = 10,
    bootstrap = true,
    maxSamples,
    options,
  }: {
    baseEstimator: any;
    numEstimators: number;
    maxSamples: number;
    bootstrap: boolean;
    options: any;
  }) {
    if (!Number.isInteger(maxSamples) && !this.maxSamplesIsInValidRange(maxSamples)) {
      throw new ValidationError('float maxSamples param must be in [0, 1]');
    }
    this.baseEstimator = baseEstimator;
    this.numEstimators = numEstimators;
    this.bootstrap = bootstrap;
    this.options = options;
    this.maxSamples = maxSamples;
  }

  public fit(X: Type2DMatrix<number>, y: Type1DMatrix<number>): void {
    const [numRows] = inferShape(X);
    const xWrapped = ensure2DMatrix(X);
    validateFitInputs(xWrapped, y);
    if (Number.isInteger(this.maxSamples) && this.maxSamples > numRows) {
      throw new ValidationError('maxSamples must be in [0, n_samples]');
    }

    for (let i = 0; i < this.numEstimators; ++i) {
      const sampleIndices = math.generateRandomSubset(numRows, this.maxSamples, this.bootstrap);
      const sampleX = sampleIndices.map((ind) => X[ind]);
      const sampleY = sampleIndices.map((ind) => y[ind]);
      const estimator = new this.baseEstimator(this.options);
      estimator.fit(sampleX, sampleY);
      this.estimators.push(estimator);
    }
  }

  public predict(X: Type2DMatrix<number>): number[] {
    const predictions = this.estimators.map((estimator) => estimator.predict(X));
    const result = [];

    for (let i = 0; i < predictions[0].length; ++i) {
      const votes = new Map();
      for (let j = 0; j < predictions.length; ++j) {
        const cnt = votes.get(predictions[j][i]) || 0;
        votes.set(predictions[j][i], cnt + 1);
      }

      const resultingVote = this.getBiggestVote(votes);
      result.push(resultingVote);
    }

    return result;
  }

  private getBiggestVote<T>(votes: Map<T, number>): T {
    return [...votes.keys()].sort((x, y) => votes.get(x) - votes.get(y))[0];
  }

  private maxSamplesIsInValidRange(maxSamples: number) {
    return maxSamples >= 0 && maxSamples <= 1;
  }
}
