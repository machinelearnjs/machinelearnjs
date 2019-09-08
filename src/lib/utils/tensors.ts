import * as tf from '@tensorflow/tfjs';
import * as _ from 'lodash';
import { Type1DMatrix, Type2DMatrix, TypeMatrix } from '../types';
import { ValidationError, ValidationInconsistentShape } from './Errors';
import { RandomStateObj } from './random';
import { validateMatrix1D, validateMatrix2D } from './validation';

/**
 * Infers shape of a tensor using TF
 *
 * @example
 * inferShape(1) // exception
 * inferShape(true) // exception
 * inferShape([1, 2]) // [2]
 * inferShape([[1, 2], [3, 4]]) // [2, 2]
 *
 * @param X
 * @ignore
 */
export function inferShape(X: TypeMatrix<any>): number[] {
  try {
    return tf.tensor(X).shape;
  } catch (e) {
    throw new ValidationInconsistentShape(e);
  }
}

/**
 * Reshapes any size of array into a new shape.
 *
 * The code was borrowed from math.js (https://github.com/josdejong/mathjs/blob/5750a1845442946d236822505c607a522be23474/src/utils/array.js#L258),
 * which enables us to use a specific method from Math.js instead of installing an entire library.
 *
 * TF.js has implemented an efficient way to return raw values from its Tensor implementation that always returns a 1D array,
 * which is not ideal in situations where we need a return value with correct shapes.
 *
 * Please check out https://github.com/tensorflow/tfjs/issues/939 for more information
 *
 * @example
 * reshape([1, 2, 3, 4, 5, 6], [2, 3]); // [[1, 2, 3], [4, 5, 6]]
 * reshape([1, 2, 3, 4, 5, 6], [2, 3, 1]); // [[[1], [2], [3]], [[4], [5], [6]]]
 *
 * @param array - Target array
 * @param sizes - New array shape to resize into
 * @ignore
 */
export function reshape<T>(array: TypeMatrix<T>, sizes: number[]): TypeMatrix<T> {
  // Initial validations
  if (!Array.isArray(array)) {
    throw new ValidationError('The input array must be an array!');
  }

  if (!Array.isArray(sizes)) {
    throw new ValidationError('The sizes must be an array!');
  }

  const deepFlatArray = _.flattenDeep<T>(array);
  // If the reshaping is to single dimensional
  if (sizes.length === 1 && deepFlatArray.length === sizes[0]) {
    return deepFlatArray;
  } else if (sizes.length === 1 && deepFlatArray.length !== sizes[0]) {
    throw new ValidationError(`Target array shape [${deepFlatArray.length}] cannot be reshaped into ${sizes}`);
  }

  // testing if there are enough elements for the requested shape
  let tmpArray = deepFlatArray;
  let tmpArray2;
  // for each dimensions starting by the last one and ignoring the first one
  for (let sizeIndex = sizes.length - 1; sizeIndex > 0; sizeIndex--) {
    const size = sizes[sizeIndex];

    tmpArray2 = [];

    // aggregate the elements of the current tmpArray in elements of the requested size
    const length = tmpArray.length / size;
    for (let i = 0; i < length; i++) {
      tmpArray2.push(tmpArray.slice(i * size, (i + 1) * size));
    }
    // set it as the new tmpArray for the next loop turn or for return
    tmpArray = tmpArray2;
  }

  return tmpArray;
}

/**
 * Ensures that matrix passed in is two dimensional
 * If passed a one dimensional matrix, transforms it into a two dimensional matrix by turning each element into a row with 1 element
 * If passed a two dimensional matrix, does nothing
 * @param X - target matrix
 * @ignore
 */
export const ensure2DMatrix = (X: Type2DMatrix<number> | Type1DMatrix<number>): Type2DMatrix<number> => {
  const shape: number[] = inferShape(X);
  if (shape.length === 2) {
    return validateMatrix2D(X);
  }
  const matrix1D = validateMatrix1D(X);
  return _.map(matrix1D, (o) => [o]);
};

/**
 *
 * @param array - target matrix
 * @ignore
 */
export function invidualize(array: Type1DMatrix<number> = null): Type2DMatrix<number> {
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

/**
 *
 * Count number of occurrences of each value in array of non-negative ints.
 * countBin([0, 1, 1, 3, 2, 1, 7]) = [1, 3, 1, 1, 0, 0, 0, 1]
 * countBin([0, 1, 1, 2, 2, 2], [0.3, 0.5, 0.2, 0.7, 1., -0.6]) = [ 0.3,  0.7,  1.1]
 * countBin([7]) = [0, 0, 0, 0, 0, 0, 0, 1]
 * @param array
 */
export function countBin(array: Type1DMatrix<number>, weights?: Type1DMatrix<number>): Type1DMatrix<number> {
  if (weights && array.length !== weights.length) {
    throw Error(`weights=${weights} and targetArray=${array} should be of same length.`);
  }
  const min: number = _.min(array);
  const max: number = _.max(array);

  const retArray = Array(max - min + 1).fill(0);
  if (!weights) {
    weights = Array(array.length).fill(1);
  }

  const arrToObj = array.reduce((acc, ele, i) => {
    if (Math.floor(ele) !== ele) {
      throw Error(`Only integer values are acceptable in the values of ${array}`);
    }
    return {
      ...acc,
      [ele]: (acc[ele] || 0) + weights[i],
    };
  }, {});

  for (let i = 0; i < retArray.length; i++) {
    if (arrToObj[i + min]) {
      retArray[i] = arrToObj[i + min];
    }
  }

  return [...Array(min).fill(0), ...retArray];
}

/**
 * Split an array into multiple sub-arrays.
 * @param array
 * @param indices_or_sections
 */

export function arraySplit(
  array: Type1DMatrix<any>,
  indices_or_sections: number | Type1DMatrix<number>,
): Type2DMatrix<any> {
  const nTotal: number = array.length;
  let nSections: number = null;
  let divPoints: tf.Tensor1D = null;
  if (indices_or_sections instanceof Array) {
    nSections = indices_or_sections.length + 1;
    divPoints = tf.tensor([0, ...indices_or_sections, nTotal]);
  } else {
    if (indices_or_sections <= 0) {
      throw Error('The number of sections can not be less than one');
    }
    nSections = Math.floor(indices_or_sections);
    const nEachSection = Math.floor(nTotal / nSections);
    const extras = nTotal % nSections;
    divPoints = tf.cumsum([
      0,
      ...Array(extras).fill(nEachSection + 1),
      ...Array(nSections - extras).fill(nEachSection),
    ]);
  }

  const subArrays: Type2DMatrix<any> = [];
  for (let i = 0; i < nSections; i++) {
    const st = divPoints.get(i);
    const end = divPoints.get(i + 1);
    subArrays.push(array.slice(st, end));
  }

  return subArrays;
}

export function approximateMode(
  classCounts: Type1DMatrix<number>,
  nDraws: number,
  rng: RandomStateObj,
): Type1DMatrix<number> {
  // this computes a bad approximation to the mode of the
  // multivariate hypergeometric given by class_counts and n_draws
  const countSum = _.sum(classCounts);
  let flooredSum = 0;
  // floored means we don't overshoot n_samples, but probably undershoot
  const { floored, remainder } = classCounts.reduce(
    (acc, val) => {
      const value = nDraws * val / countSum;
      const flooredVal = Math.floor(value);
      const diff = value - flooredVal;
      acc.continuous.push(value);
      acc.floored.push(flooredVal);
      acc.remainder.push(diff);
      flooredSum += flooredVal;
      return acc;
    },
    { floored: [], continuous: [], remainder: [] },
  );

  let needToAdd = Math.floor(nDraws - flooredSum);
  // we add samples according to how much "left over" probability
  // they had, until we arrive at n_samples
  // need_to_add = int(n_draws - floored.sum())
  if (needToAdd > 0) {
    const values = _.sortedUniq(remainder);
    for (let i = 0; i < values.length; i++) {
      const val = values[i];
      let inds = remainder.reduce((acc, rval, j) => {
        if (rval === val) {
          acc.push(j);
        }
        return acc;
      }, []);
      const addNow = Math.min(inds.length, needToAdd);
      inds = rng.choice(inds, addNow);
      floored[inds] += 1;
      needToAdd -= addNow;
      if (needToAdd === 0) {
        break;
      }
    }
  }

  return floored;
}
