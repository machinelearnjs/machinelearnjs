import * as _ from 'lodash';
import { Type2DMatrix } from '../types';
import { ValidationError, ValidationInconsistentShape } from './Errors';
import { inferShape } from './tensors';

/**
 * Return the number of elements along a given axis.
 * @param {any} X: Array like input data
 * @param {any} axis
 * @ignore
 */
const size = (X, axis = 0) => {
  const rows = _.size(X);
  if (rows === 0) {
    throw new ValidationError('Invalid input array of size 0!');
  }
  if (axis === 0) {
    return rows;
  } else if (axis === 1) {
    return _.flowRight(_.size, (a) => _.get(a, '[0]'))(X);
  }
  throw new ValidationError(`Invalid axis value ${axis} was given`);
};

/**
 * Just a dumb version of subset, which is sufficient enough for now.
 * It can only handle range of rows with a single column.
 *
 * TODO: Improve.
 * @param X
 * @param rowsRange
 * @param colsRange
 * @ignore
 */
const subset = (X, rowsRange: number[], colsRange: number[], replacement = null): any[][] => {
  // console.log('checking subset', X, rowsRange, colsRange, replacement);
  if (replacement) {
    const _X = _.cloneDeep(X);
    for (let i = 0; i < rowsRange.length; i++) {
      const rowIndex = rowsRange[i];
      colsRange.forEach((col) => {
        _X[rowIndex][col] = replacement[i];
      });
    }
    return _X;
  } else {
    const result = [];
    // TODO: Replace it with a proper matrix subset method. e.g. http://mathjs.org/docs/reference/functions/subset.html
    for (let i = 0; i < rowsRange.length; i++) {
      const rowIndex = rowsRange[i];
      const subSection = [];
      colsRange.forEach((col) => {
        subSection.push(X[rowIndex][col]);
      });
      // result.push([X[rowIndex][col]]);
      result.push(subSection);
    }
    return result;
  }
};

/**
 * Get range of values
 * @param start
 * @param stop
 * @ignore
 */
const range = (start: number, stop: number) => {
  if (!_.isNumber(start) || !_.isNumber(stop)) {
    throw new ValidationError('start and stop arguments need to be numbers');
  }
  return _.range(start, stop);
};

/**
 * Checking the maxtrix is a matrix of a certain data type (e.g. number)
 * The function also performs isMatrix against the passed in dataset
 * @param matrix
 * @param {string} _type
 * @ignore
 */
const isMatrixOf = (matrix, _type = 'number') => {
  if (!isMatrix(matrix)) {
    throw new ValidationError(`Cannot perform isMatrixOf ${_type} unless the data is matrix`);
  }
  // Checking each elements inside the matrix is not number
  // Returns an array of result per row
  const vectorChecks = matrix.map((arr) =>
    arr.some((x) => {
      // Checking type of each element
      if (_type === 'number') {
        return !_.isNumber(x);
      } else {
        throw Error('Cannot check matrix of an unknown type');
      }
    }),
  );
  // All should be false
  return vectorChecks.indexOf(true) === -1;
};

/**
 * Checking the matrix is a data of multiple rows
 * @param matrix
 * @returns {boolean}
 * @ignore
 */
const isMatrix = (matrix) => {
  if (!Array.isArray(matrix)) {
    return false;
  }
  if (_.size(matrix) === 0) {
    return false;
  }
  const isAllArray = matrix.map((arr) => _.isArray(arr));
  return isAllArray.indexOf(false) === -1;
};

/**
 * Checking the array is a type of X
 * @param arr
 * @param {string} _type
 * @returns {boolean}
 * @ignore
 */
const isArrayOf = (arr, _type = 'number') => {
  if (_type === 'number') {
    return !arr.some(isNaN);
  } else if (_type === 'string') {
    return !arr.some((x) => !_.isString(x));
  }
  throw new ValidationError(`Failed to check the array content of type ${_type}`);
};

/**
 *
 * @param {number[]} v1
 * @param {number[]} v2
 * @returns {number}
 * @ignore
 */
const euclideanDistance = (v1: number[], v2: number[]): number => {
  const v1Range = _.range(0, v1.length);
  const initialTotal = 0;
  const total = _.reduce(
    v1Range,
    (sum, i) => {
      return sum + Math.pow(v2[i] - v1[i], 2);
    },
    initialTotal,
  );

  return Math.sqrt(total);
};

/**
 *
 * @param {number[]} v1
 * @param {number[]} v2
 * @returns {number}
 * @ignore
 */
const manhattanDistance = (v1: number[], v2: number[]): number => {
  const v1Range = _.range(0, v1.length);
  const initialTotal = 0;
  return _.reduce(
    v1Range,
    (total, i) => {
      return total + Math.abs(v2[i] - v1[i]);
    },
    initialTotal,
  );
};

/**
 * Subtracts two matrices
 * @param X
 * @param y
 * @ignore
 */
const subtract = (X, y) => {
  const _X = _.clone(X);
  for (let rowIndex = 0; rowIndex < _X.length; rowIndex++) {
    const row = X[rowIndex];
    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const column = row[colIndex];
      // Supports y.length === 1 or y.length === row.length
      if (y.length === 1) {
        const subs = y[0];
        _X[rowIndex][colIndex] = column - subs;
      } else if (y.length === row.length) {
        const subs = y[colIndex];
        _X[rowIndex][colIndex] = column - subs;
      } else {
        throw Error(`Dimension of y ${y.length} and row ${row.length} are not compatible`);
      }
    }
  }
  return _X;
};

/**
 * Calculates covariance
 * @param X
 * @param xMean
 * @param y
 * @param yMean
 * @returns {number}
 * @ignore
 */
const covariance = (X, xMean, y, yMean) => {
  if (_.size(X) !== _.size(y)) {
    throw new ValidationError('X and y should match in size');
  }
  let covar = 0.0;
  for (let i = 0; i < _.size(X); i++) {
    covar += (X[i] - xMean) * (y[i] - yMean);
  }
  return covar;
};

/**
 * Calculates the variance
 * needed for linear regression
 * @param X
 * @param mean
 * @returns {number}
 * @ignore
 */
const variance = (X, mean) => {
  if (!Array.isArray(X)) {
    throw new ValidationError('X must be an array');
  }
  let result = 0.0;
  for (let i = 0; i < _.size(X); i++) {
    result += Math.pow(X[i] - mean, 2);
  }
  return result;
};

/**
 * Stack arrays in sequence horizontally (column wise).
 * This is equivalent to concatenation along the second axis, except for 1-D
 * arrays where it concatenates along the first axis. Rebuilds arrays divided by hsplit.
 *
 * @example
 * hstack([[1], [1]], [[ 0, 1, 2 ], [ 1, 0, 3 ]])
 * returns [ [ 1, 0, 1, 2 ], [ 1, 1, 0, 3 ] ]
 * @param X
 * @param y
 * @ignore
 */
const hstack = (X, y) => {
  let stack = [];
  if (isMatrix(X) && isMatrix(y)) {
    for (let i = 0; i < X.length; i++) {
      const xEntity = X[i];
      const yEntity = y[i];
      stack.push(hstack(xEntity, yEntity));
    }
  } else if (Array.isArray(X) && Array.isArray(y)) {
    stack = _.concat(X, y);
    stack = _.flatten(stack);
  } else {
    throw new ValidationError('Input should be either matrix or Arrays');
  }
  return stack;
};

/**
 * Validating the left input is an array, and the right input is a pure number.
 * @param a
 * @param b
 * @ignore
 */
const isArrayNumPair = (a, b) => Array.isArray(a) && _.isNumber(b);

/**
 * Inner product of two arrays.
 * Ordinary inner product of vectors for 1-D arrays (without complex conjugation),
 * in higher dimensions a sum product over the last axes.
 * @param a
 * @param b
 * @ignore
 */
const inner = (a, b) => {
  /**
   * Internal methods to process the inner product
   * @param a - First vector
   * @param b - Second vector or a number
   */
  // 1. If a and b are both pure numbers
  if (_.isNumber(a) && _.isNumber(b)) {
    return a * b;
  }

  // If a is a vector and b is a pure number
  if (isArrayNumPair(a, b)) {
    return a.map((x) => x * b);
  }

  // If b is a vector and a is a pure number
  if (isArrayNumPair(b, a)) {
    return b.map((x) => x * a);
  }

  // If a and b are both vectors with an identical size
  if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result += a[i] * b[i];
    }
    return result;
  } else if (Array.isArray(a) && Array.isArray(b) && a.length !== b.length) {
    throw new ValidationInconsistentShape(`Dimensions (${a.length},) and (${b.length},) are not aligned`);
  }

  throw new ValidationError(`Cannot process with the invalid inputs ${a} and ${b}`);
};

const generateRandomSubset = (
  setSize: number,
  maxSamples: number,
  bootstrap: boolean,
  maxSamplesIsFloat: boolean = true,
): number[] => {
  if (maxSamples < 0) {
    throw new ValidationError("maxSamples can't be negative");
  }
  if (!maxSamplesIsFloat && (maxSamples > setSize)) {
    throw new ValidationError('maxSamples must be in [0, n_samples]');
  }
  if (maxSamplesIsFloat && (maxSamples > 1)) {
    throw new ValidationError('maxSamplesIsFloat is true but number bigger than 1 was passed');
  }
  
  const sampleSize = maxSamplesIsFloat ? Math.floor(setSize * maxSamples) : Math.floor(maxSamples);
  const indices = [];

  if (bootstrap) {
    for (let i = 0; i < sampleSize; ++i) {
      indices.push(genRandomIndex(setSize));
    }
  } else {
    // O(n) algorithm for non-bootstrap sampling as described in this paper
    // https://sci-hub.se/10.1080/00207168208803304
    const nums = range(0, setSize);
    for (let i = 0; i < sampleSize; ++i) {
      const index = genRandomIndex(setSize - i);
      indices.push(nums[index]);
      const tmp = nums[index];
      nums[index] = nums[setSize - i - 1];
      nums[setSize - i - 1] = tmp;
    }
  }

  return indices;
};

const generateRandomSubsetOfMatrix = <T>(
  X: Type2DMatrix<T>,
  maxSamples: number = 1.0,
  maxFeatures: number = 1.0,
  bootstrapSamples: boolean,
  bootstrapFeatures: boolean,
  maxSamplesIsFloating: boolean = true,
  maxFeaturesIsFloating: boolean = true,
): [Type2DMatrix<T>, number[], number[]] => {
  const [numRows, numColumns] = inferShape(X);
  const rowIndices = generateRandomSubset(numRows, maxSamples, bootstrapSamples, maxSamplesIsFloating);
  const columnIndices = generateRandomSubset(numColumns, maxFeatures, bootstrapFeatures, maxFeaturesIsFloating);

  const result = [];
  rowIndices.forEach((i) => {
    const curRow = [];

    columnIndices.forEach((j) => {
      curRow.push(X[i][j]);
    });

    result.push(curRow);
  });

  return [result, rowIndices, columnIndices];
};

const genRandomIndex = (upperBound) => Math.floor(Math.random() * upperBound);

const math = {
  covariance,
  euclideanDistance,
  genRandomIndex,
  generateRandomSubset,
  generateRandomSubsetOfMatrix,
  hstack,
  isArrayOf,
  inner,
  isMatrix,
  isMatrixOf,
  manhattanDistance,
  range,
  subset,
  size,
  subtract,
  variance,
};

export default math;
