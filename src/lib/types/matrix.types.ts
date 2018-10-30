import * as tf from '@tensorflow/tfjs';

/**
 * Typing for a matrix
 *
 * @example
 * [[1, 2], [3, 4]]
 */
export type Type2DMatrix = ReadonlyArray<ReadonlyArray<number>> | tf.Tensor2D;
