import * as tf from '@tensorflow/tfjs';
import { flattenDeep, uniq, sum } from 'lodash';
import { inferShape, reshape } from '../ops';
import { IMlModel, Type1DMatrix, Type2DMatrix, TypeModelState } from '../types';

class DecisionStump {
  public polarity = 1;
  public featureIndex = null;
  public threshold = null;
  public alpha = null;
}

export class AdaboostClassifier implements IMlModel<number> {
  private nCls: number;
  private cls: DecisionStump[] = [];

  constructor(
    {
      n_cls = 10
    }: {
      n_cls?: number;
    } = {
      n_cls: 10
    }
  ) {
    this.nCls = n_cls;
  }

  public fit(X: Type2DMatrix<number>, y: Type1DMatrix<number>): void {
    const tensorX = tf.tensor2d(X);
    const tensorY = tf.tensor1d(y);
    const [nSamples, nFeatures] = inferShape(X);

    // Initialise weights to 1/n
    const w = Array.from(tf.fill([nSamples], 1 / nSamples).dataSync());

    for (let i = 0; i < this.nCls; i++) {
      const clf = new DecisionStump();
      // Iterate through every unique feature value and see what value
      // makes the best threshold for predicting y
      for (let j = 0; j < nFeatures; j++) {
        const featureValues = Array.from(
          tensorX
            .slice([0], [j])
            .expandDims(1)
            .dataSync()
        );
        const uniqueValues = uniq(flattenDeep(featureValues));
        // Try every unique feature as threshold
        for (let k = 0; k < uniqueValues.length; k++) {
          // Current threshold
          const threshold = uniqueValues[k];
          let p = 1;
          // Label the samples whose values are below threshold as '-1'
          const predictions = reshape(
            Array.from(tf.ones(tensorY.shape).dataSync()).map(
              x => (x < threshold ? -1 : x)
            ),
            tensorY.shape
          );
          // Sum of weights of misclassified samples
          // w = [0.213, 0.21342] -> y = [1, 2] -> prediction = [2, 2] ->
          // any index that has -1 -> grab them from w and get a sum of them
          let error = w
            .filter((el, index) => y[index] !== predictions[index])
            .reduce((total, x) => total + x);

          // If error is over 50%, flip the polarity so that
          // samples that were classified as 0 are classified as 1
          // E.g error = 0.8 => (1 - error) = 0.2
          if (error > 0.5) {
            error = 1 - error;
            p = -1;
          }
        }
      }
    }
  }

  public fromJSON(state: TypeModelState): void {}

  public predict(
    X: Type2DMatrix<number> | Type1DMatrix<number>
  ): number[] | number[][] {
    return undefined;
  }

  public toJSON(): TypeModelState {
    return undefined;
  }
}
