/* import * as tf from '@tensorflow/tfjs';

export function dataSyncRaw(
  tensor: tf.Tensor1D | tf.Tensor2D | tf.Tensor3D | tf.Tensor4D
): void {
  const rawData = tensor.dataSync();
  const shape = tensor.shape;

  // Recursion

  // const buildMatrix

  for (let i = 0; i < shape.length - 1; i++) {
    const splitPoint = rawData.length / shape[i];
    console.log(rawData, i, shape[i]);
  }
} */
