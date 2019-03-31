import {
  concat,
  countBy,
  find,
  head,
  isEqual,
  keys,
  map,
  maxBy,
  range,
  reduce,
  values
} from 'lodash';
import { DecisionTreeClassifier } from '../tree';
import { IMlModel, Type1DMatrix, Type2DMatrix } from '../types';
import { validateFitInputs, validateMatrix2D } from '../utils/validation';

/**
 * Base RandomForest implementation used by both classifier and regressor
 * @ignore
 */
export class BaseRandomForest implements IMlModel<number> {
  protected trees = [];
  protected nEstimator;
  protected randomState = null;

  /**
   *
   * @param {number} nEstimator - Number of trees.
   * @param random_state - Random seed value for DecisionTrees
   */
  constructor(
    {
      // Each object param default value
      nEstimator = 10,
      random_state = null
    }: {
      // Param types
      nEstimator?: number;
      random_state?: number;
    } = {
      // Default value on empty constructor
      nEstimator: 10,
      random_state: null
    }
  ) {
    this.nEstimator = nEstimator;
    this.randomState = random_state;
  }

  /**
   * Build a forest of trees from the training set (X, y).
   * @param {Array} X - array-like or sparse matrix of shape = [n_samples, n_features]
   * @param {Array} y - array-like, shape = [n_samples] or [n_samples, n_outputs]
   * @returns void
   */
  public fit(
    X: Type2DMatrix<number> = null,
    y: Type1DMatrix<number> = null
  ): void {
    validateFitInputs(X, y);
    this.trees = reduce(
      range(0, this.nEstimator),
      sum => {
        const tree = new DecisionTreeClassifier({
          featureLabels: null,
          random_state: this.randomState
        });
        tree.fit(X, y);
        return concat(sum, [tree]);
      },
      []
    );
  }

  /**
   * Returning the current model's checkpoint
   * @returns {{trees: any[]}}
   */
  public toJSON(): {
    /**
     * Decision trees
     */
    trees: any[];
  } {
    return {
      trees: this.trees
    };
  }

  /**
   * Restore the model from a checkpoint
   * @param {any[]} trees - Decision trees
   */
  public fromJSON({ trees = null }: { trees: any[] }): void {
    if (!trees) {
      throw new Error('You must provide both tree to restore the model');
    }
    this.trees = trees;
  }

  /**
   * Internal predict function used by either RandomForestClassifier or Regressor
   * @param X
   * @private
   */
  public predict(X: Type2DMatrix<number> = null): number[][] {
    validateMatrix2D(X);
    return map(this.trees, (tree: DecisionTreeClassifier) => {
      // TODO: Check if it's a matrix or an array
      return tree.predict(X);
    });
  }
}

/**
 * Random forest classifier creates a set of decision trees from randomly selected subset of training set.
 * It then aggregates the votes from different decision trees to decide the final class of the test object.
 *
 * @example
 * import { RandomForestClassifier } from 'machinelearn/ensemble';
 *
 * const X = [[0, 0], [1, 1], [2, 1], [1, 5], [3, 2]];
 * const y = [0, 1, 2, 3, 7];
 *
 * const randomForest = new RandomForestClassifier();
 * randomForest.fit(X, y);
 *
 * // Results in a value such as [ '0', '2' ].
 * // Predictions will change as we have not set a seed value.
 */
export class RandomForestClassifier extends BaseRandomForest {
  /**
   * Predict class for X.
   *
   * The predicted class of an input sample is a vote by the trees in the forest, weighted by their probability estimates.
   * That is, the predicted class is the one with highest mean probability estimate across the trees.
   * @param {Array} X - array-like or sparse matrix of shape = [n_samples]
   * @returns {string[]}
   */
  public predict(X: Type2DMatrix<number> = null): any[] {
    const predictions = super.predict(X);
    return this.votePredictions(predictions);
  }

  /**
   * @hidden
   * Bagging prediction helper method
   * According to the predictions returns by the trees, it will select the
   * class with the maximum number (votes)
   * @param {Array<any>} predictions - List of initial predictions that may look like [ [1, 2], [1, 1] ... ]
   * @returns {string[]}
   */
  private votePredictions(predictions: Type2DMatrix<number>): number[] {
    const counts = countBy(predictions, x => x);
    const countsArray = reduce(
      keys(counts),
      (sum, k) => {
        const returning = {};
        returning[k] = counts[k];
        return concat(sum, returning);
      },
      []
    );
    const max = maxBy(countsArray, x => head(values(x)));
    const key = head(keys(max));
    // Find the actual class values from the predictions
    return find(predictions, pred => {
      return isEqual(pred.join(','), key);
    });
  }
}
