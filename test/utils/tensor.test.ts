import * as tf from '@tensorflow/tfjs';
import { reshape } from '../../src/lib/utils/tensor';

describe('utils.reshape', () => {
  it('should reshape an array of shape [1] into [2, 3]', () => {
    const result = reshape([1, 2, 3, 4, 5, 6], [2, 3]);
    expect(result).toEqual([[1, 2, 3], [4, 5, 6]]);
  });

  it('should reshape an array of shape [2, 3] into [1]', () => {
    // console.log(tf.tensor1d([1, 2, 3]).shape);
    const result = reshape([[1, 2, 3], [4, 5, 6]], [6]);
    expect(result).toEqual(result);
  });

  it('should reshape an array of shape [1] into [2, 3, 1]', () => {
    const result = reshape([1, 2, 3, 4, 5, 6], [2, 3, 1]);
    expect(result).toEqual([[[1], [2], [3]], [[4], [5], [6]]]);
  });
});
