import * as tf from '@tensorflow/tfjs';
import { Type1DMatrix, Type2DMatrix } from '../types';

export const mean_squared_error = (
  y_true: Type1DMatrix<number> | Type2DMatrix<number>,
  y_pred: Type1DMatrix<number> | Type2DMatrix<number>,
  // Options
  {
    sample_weight = null
  }: {
    sample_weight: number;
  } = {
    sample_weight: null
  }
): number => {
  return tf.losses
    .meanSquaredError(y_true, y_pred, sample_weight)
    .dataSync()[0];
};
