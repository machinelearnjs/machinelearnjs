import * as _ from 'lodash';
import * as Random from 'random-js';
import { inferShape, validateFitInputs } from '../ops';
import { Type1DMatrix, Type2DMatrix, TypeMatrix } from '../types';

/**
 * K-Folds cross-validator
 *
 * Provides train/test indices to split data in train/test sets. Split dataset into k consecutive folds (without shuffling by default).
 *
 * Each fold is then used once as a validation while the k - 1 remaining folds form the training set.
 *
 * @example
 * import { KFold } from 'kalimdor/model_selection';
 *
 * const kFold = new KFold({ k: 5 });
 * const X1 = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
 * console.log(kFold.split(X1, X1));
 *
 * /* [ { trainIndex: [ 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19 ],
 * *  testIndex: [ 0, 1, 2, 3 ] },
 * * { trainIndex: [ 0, 1, 2, 3, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19 ],
 * *  testIndex: [ 4, 5, 6, 7 ] },
 * * { trainIndex: [ 0, 1, 2, 3, 4, 5, 6, 7, 12, 13, 14, 15, 16, 17, 18, 19 ],
 * *  testIndex: [ 8, 9, 10, 11 ] },
 * * { trainIndex: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 16, 17, 18, 19 ],
 * *  testIndex: [ 12, 13, 14, 15 ] },
 * * { trainIndex: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ],
 * *  testIndex: [ 16, 17, 18, 19 ] } ]
 *
 */
export class KFold {
  private k: number;
  private shuffle: boolean;

  /**
   *
   * @param {any} k - Number of folds. Must be at least 2.
   * @param {any} shuffle - Whether to shuffle the data before splitting into batches.
   */
  constructor({ k = 2, shuffle = false }) {
    if (k < 2) {
      throw Error('Number of folds cannot be less than 2');
    }
    this.k = k;
    this.shuffle = shuffle;
  }

  /**
   *
   * @param {any} X - Training data, where n_samples is the number of samples and n_features is the number of features.
   * @param {any} y - The target variable for supervised learning problems.
   * @returns {any[]}
   */
  public split(X: TypeMatrix<any>, y: TypeMatrix<any>): any[] {
    const xShape = inferShape(X);
    const yShape = inferShape(y);
    if (xShape.length > 0 && yShape.length > 0 && xShape[0] !== yShape[0]) {
      throw Error('X and y must have an identical size');
    }

    if (this.k > X.length || this.k > y.length) {
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
 *
 * @example
 * import { train_test_split } from 'kalimdor/model_selection';
 *
 * const X = [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9]];
 * const y = [0, 1, 2, 3, 4];
 *
 * train_test_split(X, y, {
 *   test_size: 0.33,
 *   train_size: 0.67,
 *   random_state: 42
 * });
 *
 * /*
 * * { xTest: [ [ 0, 1 ], [ 8, 9 ] ],
 * *  xTrain: [ [ 4, 5 ], [ 6, 7 ], [ 2, 3 ] ],
 * *  yTest: [ 0, 4 ],
 * *  yTrain: [ 2, 3, 1 ] }
 *
 * @param {any} X - input data
 * @param {any} y - target data
 * @param {number} test_size - size of the returning test set
 * @param {number} train_size - size of the returning training set
 * @param {number} random_state - state used to shuffle data
 * @param {boolean} clone - to clone the original data
 * @returns {{xTest: any[]; xTrain: any[]; yTest: any[]; yTrain: any[]}}
 */
export function train_test_split(
  X: Type2DMatrix<any> = null,
  y: Type1DMatrix<any> = null,
  {
    // Arguments and their default values
    test_size = 0.25,
    train_size = 0.75,
    random_state = 0,
    clone = true
  }: {
    // Param types
    test_size?: number;
    train_size?: number;
    random_state?: number;
    clone?: boolean;
  } = {
    // Default if nothing is given
    test_size: 0.25,
    train_size: 0.75,
    random_state: 0,
    clone: true
  }
): {
  xTest: any[];
  xTrain: any[];
  yTest: any[];
  yTrain: any[];
} {
  const _X = clone ? _.cloneDeep(X) : X;
  const _y = clone ? _.cloneDeep(y) : y;
  // Checking if either of these params is not array
  if (!_.isArray(_X) || !_.isArray(_y) || _X.length === 0 || _y.length === 0) {
    throw Error('X and y must be array and cannot be empty');
  }

  validateFitInputs(_X, _y);
  // Training dataset size accoding to X
  const trainSizeLength: number = _.round(train_size * _X.length);
  const testSizeLength: number = _.round(test_size * _X.length);

  if (_.round(test_size + train_size) !== 1) {
    throw Error('Sum of test_size and train_size does not equal 1');
  }
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
  const clean = (items: any[]) =>
    _.filter(items, (item: any) => !_.isUndefined(item));
  return {
    xTest: clean(xTest),
    xTrain: clean(xTrain),
    yTest: clean(yTest),
    yTrain: clean(yTrain)
  };
}
