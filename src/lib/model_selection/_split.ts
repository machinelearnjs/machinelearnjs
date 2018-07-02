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
      throw Error(`Cannot have number of splits k=${this.k} greater than the number of samples: ${_.size(X)}`);
    }

    const binSize = _.floor(_.size(X) / this.k);
    const xRange = _.range(0, _.size(X));
    const splitRange = _.range(0, this.k);
    return _.reduce(
      splitRange,
      (sum, index) => {
        // Calculate binSizeRange according to k value. e.g. 0 -> [0,1]. 1 -> [2, 3].
        const binSizeRange = _.range(index * binSize, index * binSize + binSize);
        // X index range used for test set. It can either be shuffled e.g. [ 2, 0, 1 ] or raw value [ 0, 1, 2 ]
        const testXRange = _.flowRight(x => (this.shuffle ? _.shuffle(x) : x), () => _.clone(xRange))();
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

export interface TrainTestSplitOptions {
  test_size: number;
  train_size: number;
  random_state: number;
}

/**
 *  Split arrays or matrices into random train and test subsets
 * @param {Array} X
 * @param {Array} y
 * @param {TrainTestSplitOptions} options
 * @returns {{xTest: any[]; xTrain: any[]; yTest: any[]; yTrain: any[]}}
 */
export function train_test_split(
  X = [],
  y = [],
  options: TrainTestSplitOptions = null
): {
  xTest: any[];
  xTrain: any[];
  yTest: any[];
  yTrain: any[];
} {
  const trainSize = _.get(options, 'train_size', 0.75);
  const testSize = _.get(options, 'test_size', 0.25);
  const randomState = _.get(options, 'random_state', 0);
  const clone = _.get(options, 'clone', true);

  let _X = X;
  let _y = y;
  // Cloning ..
  if (clone) {
    _X = _.cloneDeep(X);
    _y = _.cloneDeep(y);
  }

  // Checking if either of these params is not array
  if (!_.isArray(_X) || !_.isArray(_y)) {
    throw Error('X and y must be array');
  }
  // Training dataset size accoding to X
  const trainSizeLength: number = _.round(trainSize * _X.length);
  const testSizeLength: number = _.round(testSize * _X.length);

  if (_.round(testSize + trainSize) !== 1) {
    throw Error('Sum of test_size and train_size does not equal 1');
  }
  // Initiate Random engine
  const randomEngine = Random.engines.mt19937();
  randomEngine.seed(randomState);

  // split
  const xTrain = [];
  const yTrain = [];
  const xTest = [];
  const yTest = [];

  // Getting X_train and y_train
  while (xTrain.length < trainSizeLength && yTrain.length < trainSizeLength) {
    const index = Random.integer(0, X.length - 1)(randomEngine);

    // X_train
    xTrain.push(_X[index]);
    _X.splice(index, 1);

    // y_train
    yTrain.push(_y[index]);
    _y.splice(index, 1);
  }

  while (xTest.length < testSizeLength) {
    const index = Random.integer(0, _X.length - 1)(randomEngine);
    // X test
    xTest.push(_X[index]);
    _X.splice(index, 1);

    // y train
    yTest.push(_y[index]);
    _y.splice(index, 1);
  }

  // Filter return results
  const clean = (items: any[]) => _.filter(items, (item: any) => !_.isUndefined(item));
  return {
    xTest: clean(xTest),
    xTrain: clean(xTrain),
    yTest: clean(yTest),
    yTrain: clean(yTrain)
  };
}
