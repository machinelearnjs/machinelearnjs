import * as tf from '@tensorflow/tfjs';
import { Type1DMatrix, Type2DMatrix, TypeMatrix } from '../types';

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
  return tf.tensor(X).shape;
}

/**
 * Validate typical X and y train data and check they are 2D and 1D shaped respectively
 *
 * @example
 * validateTrainInputs([ [1, 2], [3, 4] ], [ 1, 2 ]) // No errors
 * validateTrainInputs([ [[1, 2], [3, 3]], [[1, 2], [3, 3]] ], [ 1, 2 ]) // Error: The matrix is not 1D shaped: [ [[1, 2], [3, 3]], [[1, 2], [3, 3]] ] of [2, 2, 2]
 *
 * @param X
 * @param y
 * @ignore
 */
export function validateFitInputs(
  X: Type2DMatrix<any>,
  y: Type1DMatrix<any>
): void {
  if (
    (Array.isArray(X) && X.length === 0) ||
    (Array.isArray(y) && y.length === 0)
  ) {
    throw new Error('Input cannot be an empty array');
  }
  // Check X is always a matrix
  const sampleShape = validateMatrix2D(X);
  // Check y is always a vector
  const targetShape = validateMatrix1D(y);
  if (sampleShape[0] !== targetShape[0]) {
    throw new TypeError(
      `Number of labels=${targetShape[0]} does not math number of samples=${
        sampleShape[0]
      }`
    );
  }
}

/**
 * Validate the matrix is 1D shaped by checking the shape's length is exactly  1
 * @param X
 * @ignore
 */
export function validateMatrix1D(X: Type1DMatrix<any>): number[] {
  const shape = inferShape(X);
  if (shape.length !== 1 || shape[0] === 0) {
    throw new TypeError(
      `The matrix is not 1D shaped: ${JSON.stringify(X)} of ${JSON.stringify(
        shape
      )}`
    );
  }
  return shape;
}

/**
 * Validate the matrix is 2D shaped by checking the shape's length is exactly 2
 * @param X - An input array
 * @ignore
 */
export function validateMatrix2D(X: Type2DMatrix<any>): number[] {
  const shape = inferShape(X);
  if (shape.length !== 2) {
    throw new TypeError(
      `The matrix is not 2D shaped: ${JSON.stringify(X)} of ${JSON.stringify(
        shape
      )}`
    );
  }
  return shape;
}
