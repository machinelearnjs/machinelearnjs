import * as tf from '@tensorflow/tfjs';
import * as _ from 'lodash';
import { Type1DMatrix, Type2DMatrix, TypeMatrix } from '../types';
import { ValidationError, ValidationInconsistentShape } from './Errors';
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
 * Calculates the covariance
 * @param X
 * @param xMean
 * @param Y
 * @param yMean
 * @ignore
 */
export const covariance = (
  X: tf.Tensor<tf.Rank.R1>,
  xMean: tf.Scalar,
  Y: tf.Tensor<tf.Rank.R1>,
  yMean: tf.Scalar,
): tf.Scalar => {
  return X.sub(xMean)
    .dot(Y.sub(yMean))
    .mul(tf.scalar(1 / X.shape[0]))
    .asScalar();
};

/**
 * Calculates the variance
 * @param X
 * @param xMean
 * @ignore
 */
export const variance = (X: tf.Tensor<tf.Rank.R1>, xMean: tf.Scalar): tf.Scalar => {
  const tmp = X.sub(xMean);
  return tmp
    .dot(tmp)
    .mul(tf.scalar(1 / X.shape[0]))
    .asScalar();
};
