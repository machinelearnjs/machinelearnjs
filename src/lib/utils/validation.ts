import * as tf from '@tensorflow/tfjs';
import * as _ from 'lodash';
import { isArray } from 'util';
import { Type1DMatrix, Type2DMatrix, TypeMatrix } from '../types';
import {
  Validation1DMatrixError,
  Validation2DMatrixError,
  ValidationClassMismatch,
  ValidationError,
  ValidationMatrixTypeError,
} from './Errors';
import { inferShape } from './tensors';

/**
 * Check below array conditions
 * - multiclass
 *    - e.g. [ [1, 2], [2, 3] ]
 *      Then it sets multiclass value to true
 * - isArray<boolean>
 *   If the given arr is an array then the value is true else false
 * @param arr
 * @returns {any}
 * @ignore
 */
export function checkArray(
  arr: unknown,
): {
  readonly isArray: boolean;
  readonly multiclass: boolean;
} {
  let result = {
    isArray: false,
    multiclass: false,
  };

  // Setting isArray flag
  if (_.isArray(arr)) {
    result = _.set(result, 'isArray', true);
  } else {
    result = _.set(result, 'isArray', false);
  }

  // Setting multiclass flag
  const firstElm = _.get(arr, '[0]');
  if (_.isArray(firstElm)) {
    result = _.set(result, 'multiclass', true);
  } else {
    result = _.set(result, 'multiclass', false);
  }

  return result;
}

/**
 * Validates the input matrix's types with the targetted types.
 * Specified target types must be one of https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof#Description
 *
 * @example
 * validateMatrixType([['z', 'z']],['string']); // no errors
 * validateMatrixType([['z', 'z']],['test']); // error: Input matrix type of ["string"] does not match with the target types ["test"]
 *
 * @param X - The input matrix
 * @param targetTypes - Target matrix types
 * @ignore
 */
export function validateMatrixType(X: TypeMatrix<any>, targetTypes: string[]): void {
  const flatX = _.flattenDeep(X);
  const xTypes = _.uniq(flatX.map((x) => typeof x));
  const sortedXTypes = _.sortBy(xTypes, (x) => x);
  const sortedTargetTypes = _.sortBy(targetTypes, (x) => x);
  if (!_.isEqual(sortedXTypes, sortedTargetTypes)) {
    throw new ValidationMatrixTypeError(
      `Input matrix type of ${JSON.stringify(sortedXTypes)} does not match with the target types ${JSON.stringify(
        sortedTargetTypes,
      )}`,
    );
  }
}

/**
 * Check that X and y have the same size across the first axis
 *
 * @example
 * validateTrainInputs([ [1, 2], [3, 4] ], [ 1, 2 ]) // No errors
 * validateTrainInputs([ [[1, 2], [3, 3]], [[1, 2], [3, 3]] ], [ 1, 2 ]) // Error: The matrix is not 1D shaped: [ [[1, 2], [3, 3]], [[1, 2], [3, 3]] ] of [2, 2, 2]
 *
 * @param X
 * @param y
 * @ignore
 */
export function validateFitInputs(X: Type2DMatrix<any> | Type1DMatrix<any>, y: Type1DMatrix<any>): void {
  if (!Array.isArray(X)) {
    throw new ValidationError('validateFitInputs received a non-array input X');
  }
  if (!Array.isArray(y)) {
    throw new ValidationError('validateFitInputs received a non-array input y');
  }

  // Check X is always a matrix
  const sampleShape = inferShape(X);
  // Check y is always a vector
  const targetShape = inferShape(y);

  if (sampleShape[0] !== targetShape[0]) {
    throw new ValidationClassMismatch(
      `Number of labels=${targetShape[0]} does not math number of samples=${sampleShape[0]}`,
    );
  }
}

/**
 * Validate the matrix is 1D shaped by checking the shape's length is exactly  1
 * @param X
 * @ignore
 */
export function validateMatrix1D(X: unknown): number[] {
  if (!isArray(X)) {
    throw new ValidationError('validateMatrix1D has received a non-array argument');
  }

  const shape = inferShape(X);

  if (shape.length !== 1 || shape[0] === 0) {
    throw new Validation1DMatrixError(`The matrix is not 1D shaped: ${JSON.stringify(X)} of ${JSON.stringify(shape)}`);
  }
  return X;
}

/**
 * Validate the matrix is 2D shaped by checking the shape's length is exactly 2
 * @param X - An input array
 * @ignore
 */
export function validateMatrix2D(X: unknown): number[][] {
  if (!Array.isArray(X)) {
    throw new ValidationError('validateMatrix2D has received a non-array argument');
  }

  const shape = inferShape(X);

  if (shape.length !== 2) {
    throw new Validation2DMatrixError(`The matrix is not 2D shaped: ${JSON.stringify(X)} of ${JSON.stringify(shape)}`);
  }
  return X;
}

/**
 * Checks that provided X matrix has the same number of features as model matrix
 * @param X - matrix to check
 * @param reference - reference matrix
 * @throws ValidationError - in case number of features doesn't match
 * @ignore
 */
export const validateFeaturesConsistency = <T>(
  X: Type2DMatrix<T> | Type1DMatrix<T>,
  reference: Type1DMatrix<T>,
): void => {
  const xShape: number[] = inferShape(X);
  const referenceShape: number[] = inferShape(reference);
  const xNumFeatures = xShape.length === 1 ? 1 : xShape[1];
  const referenceNumFeatures = referenceShape[0];
  if (xNumFeatures !== referenceNumFeatures) {
    throw new ValidationError(
      `Provided X has incorrect number of features. Should have: ${referenceNumFeatures}, got: ${xNumFeatures}`,
    );
  }
};

/**
 * Checks that provided X matrix has the same number of features as model matrix
 * @param y_true - matrix to check
 * @param y_pred - matrix to check
 * @throws ValidationError - in case any of the params are empty
 * @throws ValidationError - in case y_true and y_pred are of different shape
 * @ignore
 */
export function validateShapesEqual(
  y_true: Type1DMatrix<number> | Type2DMatrix<number> = null,
  y_pred: Type1DMatrix<number> | Type2DMatrix<number> = null,
): tf.Tensor[] {
  const yTrueTensor = tf.tensor(y_true);
  const yPredTensor = tf.tensor(y_pred);
  const yTrueShape = yTrueTensor.shape;
  const yPredShape = yPredTensor.shape;

  // Validation 1: empty array check
  if (yTrueShape[0] === 0 || yPredShape[0] === 0) {
    throw new ValidationError(`y_true ${JSON.stringify(y_true)} and y_pred ${JSON.stringify(y_pred)} cannot be empty`);
  }

  // Validation 2: Same shape
  if (!_.isEqual(yTrueShape, yPredShape)) {
    throw new ValidationError(
      `Shapes of y_true ${JSON.stringify(yTrueShape)} and y_pred ${JSON.stringify(yPredShape)} should be equal`,
    );
  }

  return [yTrueTensor, yPredTensor];
}

/**
 * get number of samples from an array
 * @param array - type matrix or tensor
 */
export function _num_samples(array: TypeMatrix<any> | tf.Tensor = null): number {
  if (!array) {
    throw new ValidationError(`array cant be null`);
  }
  if (array instanceof tf.Tensor) {
    return array.shape[0];
  }
  return array.length;
}
