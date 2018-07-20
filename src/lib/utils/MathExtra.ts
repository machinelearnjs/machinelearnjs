import * as _ from 'lodash';
import * as math from 'mathjs';

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

const contrib = {
  covariance,
  euclideanDistance,
  isArrayOf,
  isMatrix,
  isMatrixOf,
  manhattanDistance,
  range,
  size,
  subtract,
  variance
};

// Exporting merged result
// { contrib } because we want users to access contrib API like math.contrib.xx
export default _.merge(math, { contrib });
