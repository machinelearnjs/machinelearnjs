import * as tf from '@tensorflow/tfjs';
/**
 * Installs Tensorflow
 */
export const installTF = (env = 'cpu') => {
  if (process.env.NODE_ENV !== 'test') {
    require('@tensorflow/tfjs-node');
    require('@tensorflow/tfjs-node-gpu');
    tf.setBackend(env);
  }
};
