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

const contrib = {
  range,
  size
};

// Exporting merged result
// { contrib } because we want users to access contrib API like math.contrib.xx
export default _.merge(math, { contrib });
