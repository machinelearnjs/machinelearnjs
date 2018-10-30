import * as tf from '@tensorflow/tfjs';

/**
 * Typing for a 2D matrix
 */
export type Type2DMatrix = ReadonlyArray<ReadonlyArray<number>> | tf.Tensor2D;

/**
 * Typing for a 3D matrix
 */
export type Type3DMatrix =
  | ReadonlyArray<ReadonlyArray<ReadonlyArray<number>>>
  | tf.Tensor3D;

/**
 * Typeing for a 4D matrix
 */
export type Type4DMatrix =
  | ReadonlyArray<ReadonlyArray<ReadonlyArray<ReadonlyArray<number>>>>
  | tf.Tensor4D;
