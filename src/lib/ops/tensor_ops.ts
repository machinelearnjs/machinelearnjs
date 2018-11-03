import * as tf from '@tensorflow/tfjs';
import { Type1DMatrix, Type2DMatrix, TypeMatrix } from '../types/matrix.types';

/**
 * Infers shape of a tensor using TF
 * @param X
 */
export function inferShape(X: TypeMatrix<any>): number[] {
  return tf.tensor(X).shape;
}

/**
 * Validate typical X and y train data and check they are 2D and 1D shaped respectively
 *
 * @example
 * validateTrainInputs([ [1, 2], [3, 4] ], [ 1, 2 ]) // No errors
 *
 * @param X
 * @param y
 */
export function validateTrainInputs(
  X: Type2DMatrix<any>,
  y: Type1DMatrix<any>
): void {
  // Check X is always a matrix
  validateMatrix2D(X);
  // Check y is always a vector
  validateMatrix1D(y);
}

/**
 * Validate the matrix is 1D shaped by checking the shape's length is exactly  1
 * @param X
 */
export function validateMatrix1D(X: Type1DMatrix<any>): void {
  const shape = inferShape(X);
  if (shape.length !== 1) {
    throw new TypeError(`The matrix is not 1D shaped: ${X} of ${shape}`);
  }
}

/**
 * Validate the matrix is 2D shaped by checking the shape's length is exactly 2
 * @param X - An input array
 */
export function validateMatrix2D(X: Type2DMatrix<any>): void {
  const shape = inferShape(X);
  if (shape.length !== 2) {
    throw new TypeError(`The matrix is not 2D shaped: ${X} of ${shape}`);
  }
}
