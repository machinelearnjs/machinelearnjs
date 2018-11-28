import * as tf from '@tensorflow/tfjs';
import { dataSyncRaw } from '../../src/lib/utils/tensor';

describe('utils.dataSyncRaw', () => {
  it('tzz', () => {
    const x = tf.tensor2d([[1, 2, 3], [4, 5, 6]]);
    dataSyncRaw(x);
  });
});
