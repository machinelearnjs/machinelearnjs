import * as tf from '@tensorflow/tfjs';
import { isEqual } from 'lodash';
import { inferShape } from '../ops';
import { Type1DMatrix, Type2DMatrix } from '../types';

/**
 * Mean squared error regression loss
 *
 * @example
 * import { mean_squared_error } from 'kalimdor/metrics';
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
    sample_weight = null
  }: {
    sample_weight: number;
  } = {
    sample_weight: null
  }
): number {
  // console.log(inferShape(y_true));
  const yTrueShape = inferShape(y_true);
  const yPredShape = inferShape(y_pred);

  // Validation 1: empty array check
  if (yTrueShape[0] === 0 || yPredShape[0] === 0) {
    throw new TypeError(
      `y_true ${JSON.stringify(y_true)} and y_pred ${JSON.stringify(
        y_pred
      )} cannot be empty`
    );
  }

  // Validation 2: Same shape
  if (!isEqual(yTrueShape, yPredShape)) {
    throw new TypeError(
      `Shapes of y_true ${JSON.stringify(
        yTrueShape
      )} and y_pred ${JSON.stringify(yPredShape)} should be equal`
    );
  }

  return tf.losses
    .meanSquaredError(y_true, y_pred, sample_weight)
    .dataSync()[0];
}
