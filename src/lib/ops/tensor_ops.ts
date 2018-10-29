import * as tf from '@tensorflow/tfjs';

/**
 * Tensor Type covers up to 6D array
 */
type TypeTensor =
  | number[]
  | number[][]
  | number[][]
  | number[][][]
  | number[][][][]
  | number[][][][][]
  | number[][][][][][];

/**
 * Infers shape of a tensor using TF
 * @param X
 */
export function inferShape(X: TypeTensor): number[] {
  return tf.tensor(X).shape;
}
