import { DecisionTreeClassifier } from '../tree';
import { Type1DMatrix, Type2DMatrix } from '../types';
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
    baseEstimator=DecisionTreeClassifier,
    numEstimators=10,
    bootstrap=true,
    maxSamples,
    options
  }: {
    baseEstimator: any,
    numEstimators: number,
    maxSamples: number,
    bootstrap: boolean,
    options: any
  }) {
    this.baseEstimator = baseEstimator;
    this.numEstimators = numEstimators;
    this.bootstrap = bootstrap;
    this.options = options;
    this.maxSamples = maxSamples;
  }

  public fit(X: Type2DMatrix<number>, y: Type1DMatrix<number>): void {
    const xShape = inferShape(X);
    const xWrapped = ensure2DMatrix(X);
    validateFitInputs(xWrapped, y);

    for (let i = 0; i < this.numEstimators; ++i) {
      const sampleIndices = this.genRandomSubset(xShape[0]);
      const sampleX = sampleIndices.map(ind => X[ind]);
      const sampleY = sampleIndices.map(ind => y[ind]);
      const estimator = new this.baseEstimator(this.options);
      estimator.fit(sampleX, sampleY);
      this.estimators.push(estimator);
    }
  }

  public predict(X: Type2DMatrix<number>): number[] {
    const predictions = this.estimators.map(estimator => estimator.predict(X));
    const result = [];

    for (let i = 0; i < predictions[0].length; ++i) {
      const votes = new Map();
      for (let j = 0; j < predictions.length; ++j) {
        const cnt = votes.get(predictions[j][i]) || 0
        votes.set(predictions[j][i], cnt + 1);
      }

      const resultingVote = [...votes.keys()].sort((x, y) => votes.get(x) - votes.get(y))[0];
      result.push(resultingVote);
    }

    return result;
  }

  private genRandomSubset(n: number): number[] {
    const sampleSize = Math.min(this.maxSamples, n);
    const indices = [];
    const genRandomIndex = () => Math.floor(Math.random() * n);

    if (this.bootstrap) {
      for (let i = 0; i < sampleSize; ++i) {
        indices.push(genRandomIndex());
      }
    } else {
      // Non-bootstrap sampling means sampling without replacement
      // Therefore we need to check each index for uniqueness before adding it to sample
      const usedIndices = new Set();
      for (let i = 0; i < sampleSize; ++i) {
        let index = genRandomIndex();
        while (usedIndices.has(index)) {
          index = genRandomIndex();
        }

        indices.push(index)
      }
    }

    return indices;
  }
} 