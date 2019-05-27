import { DecisionTreeClassifier } from '../tree';
import { Type1DMatrix, Type2DMatrix } from '../types';
import { ValidationError } from '../utils/Errors';
import math from '../utils/MathExtra';
import { ensure2DMatrix, inferShape } from '../utils/tensors';
import { validateFitInputs } from '../utils/validation';

export class BaggingClassifier {
  private BaseEstimator: any;
  private numEstimators: number;
  private estimatorOptions: any;
  private maxSamples: number;
  private maxFeatures: number;
  private bootstrapSamples: boolean;
  private bootstrapFeatures: boolean;
  private estimators: any[] = [];
  private estimatorsFeatures: number[][] = [];
  private maxSamplesIsFloat: boolean = true;
  private maxFeaturesIsFloat: boolean = true;

  constructor({
    BaseEstimator = DecisionTreeClassifier,
    numEstimators = 10,
    maxSamples = 1.0,
    maxFeatures = 1.0,
    bootstrapSamples = false,
    bootstrapFeatures = false,
    estimatorOptions = {},
    maxSamplesIsFloat = true,
    maxFeaturesIsFloat = true,
  }: {
    BaseEstimator: any;
    numEstimators: number;
    maxSamples: number;
    maxFeatures: number;
    bootstrapSamples: boolean;
    bootstrapFeatures: boolean;
    estimatorOptions: any;
    maxSamplesIsFloat: boolean;
    maxFeaturesIsFloat: boolean;
  }) {
    if (!Number.isInteger(maxSamples) && !this.maxSamplesIsInValidRange(maxSamples)) {
      throw new ValidationError('float maxSamples param must be in [0, 1]');
    }
    this.BaseEstimator = BaseEstimator;
    this.numEstimators = numEstimators;
    this.estimatorOptions = estimatorOptions;
    this.maxSamples = maxSamples;
    this.maxFeatures = maxFeatures;
    this.bootstrapSamples = bootstrapSamples;
    this.bootstrapFeatures = bootstrapFeatures;
    this.maxSamplesIsFloat = maxSamplesIsFloat;
    this.maxFeaturesIsFloat = maxFeaturesIsFloat;
  }

  public fit(X: Type2DMatrix<number>, y: Type1DMatrix<number>): void {
    const [numRows] = inferShape(X);
    const xWrapped = ensure2DMatrix(X);
    validateFitInputs(xWrapped, y);
    if (Number.isInteger(this.maxSamples) && this.maxSamples > numRows) {
      throw new ValidationError('maxSamples must be in [0, n_samples]');
    }

    for (let i = 0; i < this.numEstimators; ++i) {
      const [sampleX, rowIndices, columnIndices] = math.generateRandomSubsetOfMatrix(
        X,
        this.maxSamples,
        this.maxFeatures,
        this.bootstrapSamples,
        this.bootstrapFeatures,
        this.maxSamplesIsFloat,
        this.maxFeaturesIsFloat,
      );
      const sampleY = rowIndices.map((ind) => y[ind]);
      const estimator = new this.BaseEstimator(this.estimatorOptions);
      this.estimatorsFeatures.push(columnIndices);
      estimator.fit(sampleX, sampleY);
      this.estimators.push(estimator);
    }
  }

  public predict(X: Type2DMatrix<number>): number[] {
    const [numRows] = inferShape(X);
    const predictions = this.estimators.map((estimator, i) =>
      estimator.predict(math.subset(X, [...Array(numRows).keys()], this.estimatorsFeatures[i])),
    );
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
