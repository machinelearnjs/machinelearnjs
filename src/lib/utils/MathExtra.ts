import * as _ from 'lodash';
import { Type1DMatrix, Type2DMatrix } from '../types/matrix.types';

/**
 * Return the number of elements along a given axis.
 * @param {any} X: Array like input data
 * @param {any} axis
 * @ignore
 */
const size = (X, axis = 0) => {
  const rows = _.size(X);
  if (rows === 0) {
    throw new Error('Invalid input array of size 0!');
  }
  if (axis === 0) {
    return rows;
  } else if (axis === 1) {
    return _.flowRight(_.size, a => _.get(a, '[0]'))(X);
  }
  throw new Error(`Invalid axis value ${axis} was given`);
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
const subset = (
  X,
  rowsRange: number[],
  colsRange: number[],
  replacement = null
): any[][] => {
  // console.log('checking subset', X, rowsRange, colsRange, replacement);
  if (replacement) {
    const _X = _.cloneDeep(X);
    for (let i = 0; i < rowsRange.length; i++) {
      const rowIndex = rowsRange[i];
      colsRange.forEach(col => {
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
      colsRange.forEach(col => {
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
    throw new Error('start and stop arguments need to be numbers');
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
    throw Error(`Cannot perform isMatrixOf ${_type} unless the data is matrix`);
  }
  // Checking each elements inside the matrix is not number
  // Returns an array of result per row
  const vectorChecks = matrix.map(arr =>
    arr.some(x => {
      // Checking type of each element
      if (_type === 'number') {
        return !_.isNumber(x);
      } else {
        throw Error('Cannot check matrix of an unknown type');
      }
    })
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
const isMatrix = matrix => {
  if (!Array.isArray(matrix)) {
    return false;
  }
  if (_.size(matrix) === 0) {
    return false;
  }
  const isAllArray = matrix.map(arr => _.isArray(arr));
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
    return !arr.some(x => !_.isString(x));
  }
  throw Error(`Failed to check the array content of type ${_type}`);
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
    initialTotal
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
    initialTotal
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
        throw Error(
          `Dimension of y ${y.length} and row ${row.length} are not compatible`
        );
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
    throw new Error('X and y should match in size');
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
    throw new Error('X must be an array');
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
    throw Error('Input should be either matrix or Arrays');
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
    return a.map(x => x * b);
  }

  // If b is a vector and a is a pure number
  if (isArrayNumPair(b, a)) {
    return b.map(x => x * a);
  }

  // If a and b are both vectors with an identical size
  if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result += a[i] * b[i];
    }
    return result;
  } else if (Array.isArray(a) && Array.isArray(b) && a.length !== b.length) {
    throw new Error(
      `Dimensions (${a.length},) and (${b.length},) are not aligned`
    );
  }

  throw new Error(`Cannot process with the invalid inputs ${a} and ${b}`);
};

/**
 * Converts 1D matrix of size N to a 2D diagonal matrix of size NxN
 * @example makeDiagonal([1, 2, 3])
 * returns [[1, 0, 0], [0, 2, 0], [0, 0, 3]
 * @param X - source array
 * @ignore
 */
const makeDiagonal = (X: Type1DMatrix<number>): Type2DMatrix<number> => {
  const xSize = X.length;
  if (xSize === 0) {
    throw new Error("Can't make diagonal matrix from an empty array");
  }

  const result = [];
  for (let i = 0; i < xSize; ++i) {
    const curArray = [];
    for (let j = 0; j < xSize; ++j) {
      curArray.push(j === i ? X[i] : 0);
    }
    result.push(curArray);
  }

  return result;
};

/**
 * Computes sigmoid function in point x
 * @param x - point in which sigmoid is computed
 * @ignore
 */
const sigmoid = (x: number): number => {
  if (x >= 0) {
    const z = Math.exp(-x);
    return 1 / (1 + z);
  } else {
    const z = Math.exp(x);
    return z / (1 + z);
  }
};

/**
 * Computes derivative of sigmoid function in point x
 * @param x - point in which gradient is computed
 * @ignore
 */
const sigmoidDerivative = (x: number): number => {
  const sigm = sigmoid(x);
  return sigm * (1 - sigm);
};

/**
 * Applies sigmoid derivative function to each element of 1D matrix
 * @param X - source 1D matrix
 * @ignore
 */
const sigmoidDerivative1D = (X: Type1DMatrix<number>): Type1DMatrix<number> => {
  return X.map(x => sigmoidDerivative(x));
};

/**
 * Applies sigmoid derivative function to each element of 2D matrix
 * @param X - source 2D matrix
 * @ignore
 */
const sigmoidDerivative2D = (X: Type2DMatrix<number>): Type2DMatrix<number> => {
  return X.map(x => sigmoidDerivative1D(x));
};

const math = {
  covariance,
  euclideanDistance,
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
  makeDiagonal,
  sigmoid,
  sigmoidDerivative,
  sigmoidDerivative1D,
  sigmoidDerivative2D
};

export default math;
