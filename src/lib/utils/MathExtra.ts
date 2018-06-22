import * as _ from 'lodash';
import * as math from 'mathjs';

/**
 * Return the number of elements along a given axis.
 * @param {any} X: Array like input data
 * @param {any} axis
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
 */
const isMatrixOf = (matrix, _type='number') => {
  if (!isMatrix(matrix)) {
    throw Error(`Cannot perform isMatrixOf ${_type} unless the matrix is matrix`);
  }
  if (_type === 'number') {
    // Checking each elements inside the matrix is not number
    // Returns an array of result per row
    const vectorChecks = matrix.map(arr => arr.some(x => !_.isNumber(x)));
    // All should be false
    return vectorChecks.indexOf(true) === -1;
  }
  throw Error('Cannot check matrix of an unknown type');
}

/**
 * Checking the matrix is a data of multiple rows
 * @param matrix
 * @returns {boolean}
 */
const isMatrix = (matrix) => {
  const isAllArray = matrix.map(arr => _.isArray(arr));
  return isAllArray.indexOf(false) === -1;
}

const isArrayOf = (arr, _type='number') => {
  if (_type === 'number') {
    return !arr.some(isNaN);
  }
  throw Error(`Failed to check the array content of type ${_type}`);
}

const contrib = {
  range,
  size,
  isMatrix,
  isMatrixOf,
  isArrayOf
};

// Exporting merged result
// { contrib } because we want users to access contrib API like math.contrib.xx
export default _.merge(math, { contrib });
