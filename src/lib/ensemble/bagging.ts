/**
 * References:
 * - https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.BaggingClassifier.html
 */
import { DecisionTreeClassifier } from '../tree';
import { Type1DMatrix, Type2DMatrix } from '../types';
import math from '../utils/MathExtra';
import { ensure2DMatrix, inferShape } from '../utils/tensors';
import { validateFitInputs } from '../utils/validation';

/**
 * A Bagging classifier is an ensemble meta-estimator that fits
 * base classifiers each on random subsets of the original dataset
 * and then aggregate their individual predictions by voting
 * to form a final prediction
 *
 * @example
 * const classifier = new BaggingClassifier({
 *  baseEstimator: LogisticRegression,
 *  maxSamples: 1.0,
 * });
 * const X = [[1], [2], [3], [4], [5]];
 * const y = [1, 1, 1, 1, 1];
 * classifier.fit(X, y);
 * classifier.predict(X);
 */
export class BaggingClassifier {
  private baseEstimator: any;
  private numEstimators: number;
  private estimatorOptions: any;
  private maxSamples: number;
  private maxFeatures: number;
  private bootstrapSamples: boolean;
  private bootstrapFeatures: boolean;
  private estimators: any[] = [];
  private estimatorsFeatures: number[][] = [];
  private maxSamplesIsFloating: boolean = true;
  private maxFeaturesIsFloating: boolean = true;

  /**
   * @param baseEstimator - The model that will be used as a basis of ensemble.
   * @param numEstimators - The number of estimators that will be used in ensemble.
   * @param maxSamples - The number of samples to draw from X to train each base estimator.
   *  Is used in conjunction with maxSamplesIsFloating.
   *  If @param maxSamplesIsFloating is false, then draw maxSamples samples.
   *  If @param maxSamplesIsFloating is true, then draw max_samples * shape(X)[0] samples.
   * @param maxFeatures - The number of features to draw from X to train each base estimator.
   *  Is used in conjunction with @param maxFeaturesIsFloating
   *  If maxFeaturesIsFloating is false, then draw max_features features.
   *  If maxFeaturesIsFloating is true, then draw max_features * shape(X)[1] features.
   * @param bootstrapSamples - Whether samples are drawn with replacement. If false, sampling without replacement is performed.
   * @param bootstrapFeatures - Whether features are drawn with replacement.
   * @param estimatorOptions - constructor options for BaseEstimator.
   * @param maxSamplesIsFloating -
   */

  constructor({
    baseEstimator = DecisionTreeClassifier,
    numEstimators = 10,
    maxSamples = 1.0,
    maxFeatures = 1.0,
    bootstrapSamples = false,
    bootstrapFeatures = false,
    estimatorOptions = {},
    maxSamplesIsFloating = true,
    maxFeaturesIsFloating = true,
  }: {
    baseEstimator?: any;
    numEstimators?: number;
    maxSamples?: number;
    maxFeatures?: number;
    bootstrapSamples?: boolean;
    bootstrapFeatures?: boolean;
    estimatorOptions?: any;
    maxSamplesIsFloating?: boolean;
    maxFeaturesIsFloating?: boolean;
  }) {
    this.baseEstimator = baseEstimator;
    this.numEstimators = numEstimators;
    this.estimatorOptions = estimatorOptions;
    this.maxSamples = maxSamples;
    this.maxFeatures = maxFeatures;
    this.bootstrapSamples = bootstrapSamples;
    this.bootstrapFeatures = bootstrapFeatures;
    this.maxSamplesIsFloating = maxSamplesIsFloating;
    this.maxFeaturesIsFloating = maxFeaturesIsFloating;
  }

  /**
   * Builds an ensemble of base classifier from the training set (X, y).
   * @param {Array} X - array-like or sparse matrix of shape = [n_samples, n_features]
   * @param {Array} y - array-like, shape = [n_samples]
   * @returns void
   */
  public fit(X: Type2DMatrix<number>, y: Type1DMatrix<number>): void {
    const xWrapped = ensure2DMatrix(X);
    validateFitInputs(xWrapped, y);

    for (let i = 0; i < this.numEstimators; ++i) {
      const [sampleX, rowIndices, columnIndices] = math.generateRandomSubsetOfMatrix(
        X,
        this.maxSamples,
        this.maxFeatures,
        this.bootstrapSamples,
        this.bootstrapFeatures,
        this.maxSamplesIsFloating,
        this.maxFeaturesIsFloating,
      );
      const sampleY = rowIndices.map((ind) => y[ind]);
      const estimator = new this.baseEstimator(this.estimatorOptions);
      this.estimatorsFeatures.push(columnIndices);
      estimator.fit(sampleX, sampleY);
      this.estimators.push(estimator);
    }
  }

  /**
   * Predict class for each row in X.
   *
   * Predictions are formed using the majority voting.
   * @param {Array} X - array-like or sparse matrix of shape = [n_samples, n_features]
   * @returns {Array} - array of shape [n_samples] that contains predicted class for each point X
   */
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

  /**
   * Get the model details in JSON format
   */
  public toJSON(): {
    baseEstimator: any;
    numEstimators: number;
    maxSamples: number;
    maxFeatures: number;
    bootstrapSamples: boolean;
    bootstrapFeatures: boolean;
    estimatorOptions: any;
    maxSamplesIsFloating: boolean;
    maxFeaturesIsFloating: boolean;
    estimators: any[];
    estimatorsFeatures: number[][];
  } {
    return {
      baseEstimator: this.baseEstimator,
      numEstimators: this.numEstimators,
      maxSamples: this.maxSamples,
      maxFeatures: this.maxFeatures,
      bootstrapSamples: this.bootstrapSamples,
      bootstrapFeatures: this.bootstrapFeatures,
      estimatorOptions: this.estimatorOptions,
      maxSamplesIsFloating: this.maxSamplesIsFloating,
      maxFeaturesIsFloating: this.maxFeaturesIsFloating,
      estimators: this.estimators,
      estimatorsFeatures: this.estimatorsFeatures,
    };
  }

  /**
   * Restore the model from a checkpoint
   * @param checkPoint
   */
  public fromJSON(checkPoint: {
    baseEstimator: any;
    numEstimators: number;
    maxSamples: number;
    maxFeatures: number;
    bootstrapSamples: boolean;
    bootstrapFeatures: boolean;
    estimatorOptions: any;
    maxSamplesIsFloating: boolean;
    maxFeaturesIsFloating: boolean;
    estimators: any[];
    estimatorsFeatures: number[][];
  }): void {
    for (const [k, v] of Object.entries(checkPoint)) {
      this[k] = v;
    }
  }

  /**
   * Retrieves the biggest vote from the votes map
   * @param votes
   */
  private getBiggestVote<T>(votes: Map<T, number>): T {
    let maxValue = -1;
    let maxKey;
    for (const [k, v] of votes.entries()) {
      if (v > maxValue) {
        maxValue = v;
        maxKey = k;
      }
    }

    return maxKey;
  }
}
