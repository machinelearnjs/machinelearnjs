import * as _ from 'lodash';
import * as Random from 'random-js';

/**
 * K-Folds cross-validator
 *
 * Provides train/test indices to split data in train/test sets. Split dataset into k consecutive folds (without shuffling by default).
 *
 * Each fold is then used once as a validation while the k - 1 remaining folds form the training set.
 */
export class KFold {
  public k: number;
  public shuffle: boolean;
  public randomState: number | null;

  /**
   *
   * @param {any} k - Number of folds. Must be at least 2.
   * @param {any} shuffle - Whether to shuffle the data before splitting into batches.
   * @param {any} randomState - If int, random_state is the seed used by the random number generator; If RandomState instance, random_state is the random number generator;
   *                            If None, the random number generator is the RandomState instance used by np.random. Used when shuffle === true.
   */
  constructor({ k = 2, shuffle = false, randomState = null }) {
    if (k < 2) {
      throw Error('Number of folds cannot be less than 2');
    }
    this.k = k;
    this.shuffle = shuffle;
    this.randomState = randomState;
  }

  /**
   *
   * @param {any} X - Training data, where n_samples is the number of samples and n_features is the number of features.
   * @param {any} y - The target variable for supervised learning problems.
   * @returns {any[]}
   */
  public split({ X, y }): any[] {
    if (_.size(X) !== _.size(y)) {
      throw Error('X and y must have an identical size');
    }

    if (this.k > _.size(X) || this.k > _.size(y)) {
      throw Error(
        `Cannot have number of splits k=${
          this.k
        } greater than the number of samples: ${_.size(X)}`
      );
    }

    const binSize = _.floor(_.size(X) / this.k);
    const xRange = _.range(0, _.size(X));
    const splitRange = _.range(0, this.k);
    return _.reduce(
      splitRange,
      (sum, index) => {
        // Calculate binSizeRange according to k value. e.g. 0 -> [0,1]. 1 -> [2, 3].
        const binSizeRange = _.range(
          index * binSize,
          index * binSize + binSize
        );
        // X index range used for test set. It can either be shuffled e.g. [ 2, 0, 1 ] or raw value [ 0, 1, 2 ]
        const testXRange = _.flowRight(
          x => (this.shuffle ? _.shuffle(x) : x),
          () => _.clone(xRange)
        )();
        // Getting testIndex according to binSizeRange from testXRange
        const testIndex = _.reduce(
          binSizeRange,
          (xIndeces, i) => {
            return _.concat(xIndeces, [testXRange[i]]);
          },
          []
        );
        const trainIndex = _.pullAll(_.clone(xRange), testIndex);
        return _.concat(sum, [{ trainIndex, testIndex }]);
      },
      []
    );
  }
}

/**
 * Split arrays or matrices into random train and test subsets
 * @param {any[]} X
 * @param {any[]} y
 * @param {Number} test_size
 * @param {Number} train_size
 * @param {Number} random_state
 * @param {boolean} shuffle
 * return X_train, y_train, X_test, y_test
 */
export function train_test_split(
  X = [],
  y = [],
  {
    // Options
    test_size = 0.25,
    train_size = 0.75,
    random_state = 0
    // shuffle = false,
    // stratify = false
  } = {}
): {
  xTest: any[];
  xTrain: any[];
  yTest: any[];
  yTrain: any[];
} {
  // Training dataset size accoding to X
  const trainSizeLength: number = _.round(train_size * X.length);
  const testSizeLength: number = _.round(test_size * X.length);
  // Initiate Random engine
  const randomEngine = Random.engines.mt19937();
  randomEngine.seed(random_state);

  // split
  const xTrain = [];
  const yTrain = [];
  const xTest = [];
  const yTest = [];

  // Getting X_train and y_train
  while (xTrain.length < trainSizeLength && yTrain.length < trainSizeLength) {
    const index = Random.integer(0, X.length - 1)(randomEngine);

    // X_train
    xTrain.push(X[index]);
    X.splice(index, 1);

    // y_train
    yTrain.push(y[index]);
    y.splice(index, 1);
  }

  while (xTest.length < testSizeLength) {
    const index = Random.integer(0, X.length - 1)(randomEngine);
    // X test
    xTest.push(X[index]);
    X.splice(index, 1);

    // y train
    yTest.push(y[index]);
    y.splice(index, 1);
  }

  // Filter return results
  const clean = _.flowRight(
    // Filter out any undefined values
    items => _.filter(items, item => !_.isUndefined(item))
  );

  return {
    xTest: clean(xTest),
    xTrain: clean(xTrain),
    yTest: clean(yTest),
    yTrain: clean(yTrain)
  };
}
