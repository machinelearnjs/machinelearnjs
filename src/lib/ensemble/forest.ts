import * as _ from 'lodash';
import { DecisionTreeClassifier } from '../tree/tree';

/**
 * Random forest classifier creates a set of decision trees from randomly selected subset of training set.
 * It then aggregates the votes from different decision trees to decide the final class of the test object.
 *
 * @example
 * import { RandomForestClassifier } from 'kalimdor/ensemble';
 *
 * const X = [[0, 0], [1, 1], [2, 1], [1, 5], [3, 2]];
 * const y = [0, 1, 2, 3, 7];
 *
 * const randomForest = new RandomForestClassifier();
 * randomForest.fit({ X, y });
 *
 * // Results in a value such as [ '7', '2' ].
 * // Predictions will change as we have not set a seed value.
 */
export class RandomForestClassifier {
  private trees = [];
  private nEstimator;

  /**
   *
   * @param {number} nEstimator - Number of trees.
   */
  constructor(
    {
      // Each object param default value
      nEstimator = 10
    }: {
      // Param types
      nEstimator: number;
    } = {
      // Default value on empty constructor
      nEstimator: 10
    }
  ) {
    this.nEstimator = nEstimator;
  }

  /**
   * Build a forest of trees from the training set (X, y).
   * @param {Array} X - array-like or sparse matrix of shape = [n_samples, n_features]
   * @param {Array} y - array-like, shape = [n_samples] or [n_samples, n_outputs]
   * @returns void
   */
  public fit({ X = [], y = [] }: { X: number[][]; y: number[] }): void {
    this.trees = _.reduce(
      _.range(0, this.nEstimator),
      sum => {
        const tree = new DecisionTreeClassifier({
          featureLabels: null,
          randomise: true
        });
        tree.fit({ X, y });
        return _.concat(sum, [tree]);
      },
      []
    );
  }

  /**
   * Predict class for X.
   *
   * The predicted class of an input sample is a vote by the trees in the forest, weighted by their probability estimates.
   * That is, the predicted class is the one with highest mean probability estimate across the trees.
   * @param {Array} X - array-like or sparse matrix of shape = [n_samples]
   * @returns {string[]}
   */
  public predict(X: number[] | number[][] = []): any[] {
    const predictions = _.map(this.trees, tree => {
      return tree.predict({ X });
    });
    return this.baggingPrediction(predictions);
  }

  /**
   * @hidden
   * Bagging prediction help method
   * According to the predictions returns by the trees, it will select the
   * class with the maximum number (votes)
   * @param {Array<any>} predictions - List of initial predictions that may look like [ [1, 2], [1, 1] ... ]
   * @returns {string[]}
   */
  private baggingPrediction(predictions: any[]): string[] {
    const counts = _.countBy(predictions, x => x);
    const countsArray = _.reduce(
      _.keys(counts),
      (sum, k) => {
        const returning = {};
        returning[k] = counts[k];
        return _.concat(sum, returning);
      },
      []
    );
    const max = _.maxBy(countsArray, x => _.head(_.values(x)));
    const key = _.head(_.keys(max));
    // Returning bagging pred result
    return _.split(key, ',');
  }
}
