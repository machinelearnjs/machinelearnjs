import { Tensor } from '@tensorflow/tfjs';
import * as _ from 'lodash';
import * as Random from 'random-js';
import { Type1DMatrix, Type2DMatrix } from '../types';
import { ValidationError } from '../utils/Errors';
import { convertToTensor, inferShape } from '../utils/tensors';
import { _num_samples, validateFitInputs } from '../utils/validation';

const testShapes = (X: Type1DMatrix<any> | Type2DMatrix<any> | Tensor = null, y: Type1DMatrix<any> | Tensor = null) => {
  const xShape = inferShape(X);
  const yShape = inferShape(y);
  if (xShape.length > 0 && yShape.length > 0 && xShape[0] !== yShape[0]) {
    throw new ValidationError('X and y must have an identical size');
  }
};
/**
 * K-Folds cross-validator
 *
 * Provides train/test indices to split data in train/test sets. Split dataset into k consecutive folds (without shuffling by default).
 *
 * Each fold is then used once as a validation while the k - 1 remaining folds form the training set.
 *
 * @example
 * import { KFold } from 'machinelearn/model_selection';
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
      throw new ValidationError('Number of folds cannot be less than 2');
    }
    this.k = k;
    this.shuffle = shuffle;
  }
  /**
   *
   * @param X - Training data, where n_samples is the number of samples and n_features is the number of features.
   * @param y - The target variable for supervised learning problems.
   * @returns {any[]}
   */
  public split(X: Type1DMatrix<any> = null, y: Type1DMatrix<any> = null): any[] {
    testShapes(X, y);
    if (this.k > X.length || this.k > y.length) {
      throw new ValidationError(
        `Cannot have number of splits k=${this.k} greater than the number of samples: ${_.size(X)}`,
      );
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
        const testXRange = _.flowRight((x) => (this.shuffle ? _.shuffle(x) : x), () => _.clone(xRange))();
        // Getting testIndex according to binSizeRange from testXRange
        const testIndex = _.reduce(
          binSizeRange,
          (xIndeces, i) => {
            return _.concat(xIndeces, [testXRange[i]]);
          },
          [],
        );
        const trainIndex = _.pullAll(_.clone(xRange), testIndex);
        return _.concat(sum, [{ trainIndex, testIndex }]);
      },
      [],
    );
  }
}

/**
 * Split arrays or matrices into random train and test subsets
 *
 * @example
 * import { train_test_split } from 'machinelearn/model_selection';
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
    clone = true,
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
    clone: true,
  },
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
    throw new ValidationError('X and y must be array and cannot be empty');
  }

  validateFitInputs(_X, _y);
  // Training dataset size accoding to X
  const trainSizeLength: number = _.round(train_size * _X.length);
  const testSizeLength: number = _.round(test_size * _X.length);

  if (_.round(test_size + train_size) !== 1) {
    throw new ValidationError('Sum of test_size and train_size does not equal 1');
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
  const clean = (items: any[]) => _.filter(items, (item: any) => !_.isUndefined(item));
  return {
    xTest: clean(xTest),
    xTrain: clean(xTrain),
    yTest: clean(yTest),
    yTrain: clean(yTrain),
  };
}

const rangeValidationError = (type, size, n_samples) => `${type}=${size} should be either 
positive and smaller than number of samples ${n_samples} or a float in (0, 1) range`;

const testRangeValidationError = (test_size, n_samples) => rangeValidationError('test_size', test_size, n_samples);

const trainRangeValidationError = (test_size, n_samples) => rangeValidationError('test_size', test_size, n_samples);

function uniq(array: Type1DMatrix<any> = null): Type2DMatrix<number> {
  const uniqArray = _.uniq(_.flatten(array)).sort();
  let min = Number.MAX_VALUE;
  let max = Number.MIN_VALUE;

  const valueCount = {};
  const uniqIndexMap = uniqArray.reduce((acc, ele, i) => {
    if (min > ele) {
      min = ele;
    }

    if (max < ele) {
      max = ele;
    }

    return {
      ...acc,
      [ele]: i,
    };
  }, {});

  const indexMap = array.map((ele) => {
    if (valueCount[ele]) {
      valueCount[ele] += 1;
    } else {
      valueCount[ele] = 1;
    }
    return uniqIndexMap[ele];
  });

  return [uniqArray, indexMap];
}

function binCount(array: number[]) {
  const min: number = _.min(array);
  const max: number = _.max(array);

  const arrToObj = array.reduce(
    (acc, ele, i) => ({
      ...acc,
      [ele]: i,
    }),
    {},
  );
  const retArray = Array(max - min).fill(0);
  for (let i = 0; i < retArray.length; i++) {
    if (arrToObj[i + min]) {
      retArray[i] = arrToObj[i + min];
    }
  }

  return retArray;
}
export class StratifiedShuffleSplit {
  // private n_splits: number;
  private test_size: number;
  private train_size: number;
  // private random_state: number;
  private default_test_size: number = 0.1;
  constructor(
    // n_splits: number = 10,
    test_size: number = null,
    train_size: number = null,
    // random_state: number = null
  ) {
    // this.n_splits = n_splits;
    this.test_size = test_size;
    this.train_size = train_size;
    // this.random_state = random_state;
  }

  split = (X: Type1DMatrix<any> | Type2DMatrix<any> = null, y: Type1DMatrix<any> = null): any[] => {
    const XTensor = convertToTensor(X);
    // const yTensor = convertToTensor(y);
    const n_samples = _num_samples(XTensor);

    const [n_test, n_train] = validate_shuffle_split(
      n_samples,
      this.test_size,
      this.train_size,
      this.default_test_size,
    );

    const [classes, y_indices] = uniq(y);
    const n_classes = classes.length;
    const class_counts = binCount(y_indices);

    if (_.min(class_counts) < 2) {
      throw new Error(
        `The least populated class in y=${y} has only 1 member, which is too few. The minimum number of groups for any class cannot be less than 2.`,
      );
    }

    if (n_train < n_classes) {
      throw new Error(`The train_size = ${n_train} should be greater or equal to the number of classes = ${n_classes}`);
    }

    if (n_test < n_classes) {
      throw new Error(`The test_size = ${n_test} should be greater or equal to the number of classes = ${n_classes}`);
    }

    return [];
  };

  private;
}

function validate_shuffle_split(
  n_samples: number,
  test_size: number,
  train_size: number,
  default_test_size: number,
): number[] {
  let n_train: number;
  let n_test: number;

  if (!test_size && !train_size) {
    test_size = default_test_size;
  }

  if (test_size) {
    if (Number.isInteger(test_size)) {
      if (test_size >= n_samples || test_size <= 0) {
        throw new ValidationError(testRangeValidationError(test_size, n_samples));
      }

      n_test = test_size;
    } else {
      if (test_size <= 0 || test_size >= 1) {
        throw new ValidationError(testRangeValidationError(test_size, n_samples));
      }

      n_test = Math.ceil(test_size * n_samples);
    }
  }

  if (train_size) {
    if (Number.isInteger(train_size)) {
      if (train_size >= n_samples || train_size <= 0) {
        throw new ValidationError(trainRangeValidationError(train_size, n_samples));
      }

      n_train = test_size;
    } else {
      if (test_size <= 0 || test_size >= 1) {
        throw new ValidationError(trainRangeValidationError(train_size, n_samples));
      }

      n_train = Math.ceil(train_size * n_samples);
    }
  }

  if (!train_size) {
    n_train = n_samples - n_test;
  } else if (!test_size) {
    n_test = n_samples - n_train;
  }

  const total = n_train + n_test;
  if (total > n_samples) {
    throw new ValidationError(
      `The sum of train_size and test_size = ${total}, ` +
        'should be smaller than the number of ' +
        `samples ${n_samples}. Reduce test_size and/or ` +
        'train_size.',
    );
  }

  if (n_train === 0) {
    throw new ValidationError(
      `With n_samples=${n_samples}, test_size=${test_size} and train_size=${train_size}, the ` +
        'resulting train set will be empty. Adjust any of the ' +
        'aforementioned parameters.',
    );
  }
  return [Math.round(n_test), Math.round(n_train)];
}
