import * as tf from '@tensorflow/tfjs';
import { isEqual } from 'lodash';
import { Type1DMatrix, Type2DMatrix } from '../types';
import { inferShape } from '../utils/tensors';

/**
 * Mean absolute error regression loss
 *
 * @example
 * import { mean_absolute_error } from 'machinelearn/metrics';
 * const y_true = [3, -0.5, 2, 7]
 * const y_pred = [2.5, 0.0, 2, 8]
 * mean_absolute_error(y_true, y_pred); // 0.5
 *
 * @param y_true - Ground truth (correct) target values.
 * @param y_pred - Estimated target values.
 * @param sample_weight - Sample weights.
 */
export function mean_absolute_error(
  y_true: Type1DMatrix<number> | Type2DMatrix<number> = null,
  y_pred: Type1DMatrix<number> | Type2DMatrix<number> = null,
  // Options
  {
    sample_weight = null,
  }: {
    sample_weight: Type1DMatrix<number>;
  } = {
    sample_weight: null,
  },
): number {
  const yTrueShape = inferShape(y_true);
  const yPredShape = inferShape(y_pred);

  // Validation 1: empty array check
  if (yTrueShape[0] === 0 || yPredShape[0] === 0) {
    throw new TypeError(`y_true ${JSON.stringify(y_true)} and y_pred ${JSON.stringify(y_pred)} cannot be empty`);
  }

  if (sample_weight !== null) {
    const weightShape = inferShape(sample_weight);
    if (!isEqual(yTrueShape, weightShape)) {
      throw new TypeError(`The shape of ${JSON.stringify(weightShape)}
       does not match with the sample size ${JSON.stringify(yTrueShape)}`);
    }
  }

  // Validation 2: Same shape
  if (!isEqual(yTrueShape, yPredShape)) {
    throw new TypeError(
      `The shapes of y_true ${JSON.stringify(yTrueShape)} and y_pred ${JSON.stringify(yPredShape)} should be equal`,
    );
  }

  /**
   * Compute the weighted average along the specified axis.
   *
   * @example
   * average(tf.tensor1d([1, 2, 3, 4])).dataSync(); // [2.5]
   *
   * @param X - Array containing data to be averaged. If a is not an array, a conversion is attempted.
   * @param axis - Axis along which to average a. If None, averaging is done over the flattened array.
   * @param w - An array of weights associated with the values in a. Each value in a contributes to the average according to its associated weight. The weights array can either be 1-D (in which case its length must be the size of a along the given axis) or of the same shape as a. If weights=None, then all data in a are assumed to have a weight equal to one.
   * @ignore
   */
  const average = (X: tf.Tensor, axis: number = 0, w: Type1DMatrix<number> | null = null): tf.Tensor => {
    if (w !== null) {
      const wgt = tf.tensor1d(w);
      const scl = wgt.sum(axis);
      return tf
        .mul(X, wgt)
        .sum(axis)
        .div(scl);
    } else {
      const sample_size = X.size;
      return tf.div(tf.sum(X), tf.scalar(sample_size));
    }
  };
  const output_errors = tf.abs(tf.sub(y_true, y_pred));
  const avg_errors = average(output_errors, 0, sample_weight);
  return average(avg_errors).dataSync()[0];
}

/**
 * Mean squared error regression loss
 *
 * @example
 * import { mean_squared_error } from 'machinelearn/metrics';
 *
 * const y_true = [3, -0.5, 2, 7];
 * const y_pred = [2.5, 0.0, 2, 8];
 *
 * console.log(mean_squared_error(y_true, y_pred));
 * // result: 0.375
 *
 * const y_true1 = [[0.5, 1], [-1, 1], [7, -6]];
 * const y_pred1 = [[0, 2], [-1, 2], [8, -5]];
 *
 * console.log(mean_squared_error(y_true1, y_pred1));
 * // result: 0.7083333134651184
 *
 * @param y_true - Ground truth (correct) target values.
 * @param y_pred - Estimated target values.
 */
export function mean_squared_error(
  y_true: Type1DMatrix<number> | Type2DMatrix<number> = null,
  y_pred: Type1DMatrix<number> | Type2DMatrix<number> = null,
  // Options
  {
    /**
     * Sample weights.
     */
    sample_weight = null,
  }: {
    sample_weight: number;
  } = {
    sample_weight: null,
  },
): number {
  const yTrueShape = inferShape(y_true);
  const yPredShape = inferShape(y_pred);

  // Validation 1: empty array check
  if (yTrueShape[0] === 0 || yPredShape[0] === 0) {
    throw new TypeError(`y_true ${JSON.stringify(y_true)} and y_pred ${JSON.stringify(y_pred)} cannot be empty`);
  }

  // Validation 2: Same shape
  if (!isEqual(yTrueShape, yPredShape)) {
    throw new TypeError(
      `Shapes of y_true ${JSON.stringify(yTrueShape)} and y_pred ${JSON.stringify(yPredShape)} should be equal`,
    );
  }

  return tf.losses.meanSquaredError(y_true, y_pred, sample_weight).dataSync()[0];
}
