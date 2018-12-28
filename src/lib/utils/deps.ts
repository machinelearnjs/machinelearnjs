/**
 * Installs Tensorflow
 */
export const installTF = () => {
  if (process.env.NODE_ENV !== 'test') {
    require('@tensorflow/tfjs-node');
  }
};
