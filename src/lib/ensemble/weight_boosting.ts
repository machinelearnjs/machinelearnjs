import * as tf from '@tensorflow/tfjs';
import { uniq } from 'lodash';
import { inferShape } from '../ops';
import { IMlModel, Type1DMatrix, Type2DMatrix, TypeModelState } from '../types';

class DecisionStump {
  public polarity: number = 1;
  public featureIndex: number = null;
  public threshold = null;
  public alpha: number = null;

  public getTsPolarity(): tf.Scalar {
    return tf.scalar(this.polarity);
  }

  public getTsThreshold(): tf.Scalar {
    return tf.scalar(this.threshold);
  }
}

export class AdaboostClassifier implements IMlModel<number> {
  private nCls: number;
  private classifiers: DecisionStump[] = [];

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
    let w = tf.fill([nSamples], 1 / nSamples);

    for (let i = 0; i < this.nCls; i++) {
      const clf = new DecisionStump();
      let minError = Infinity;
      // Iterate through every unique feature value and see what value
      // makes the best threshold for predicting y
      for (let featureIndex = 0; featureIndex < nFeatures; featureIndex++) {
        const featureValues = tensorX
          .gather([featureIndex] as any, 1)
          .expandDims(1)
          .squeeze();
        const uniqueValues = uniq([...featureValues.dataSync()]);

        // Try every unique feature as threshold
        for (let k = 0; k < uniqueValues.length; k++) {
          // Current threshold
          const threshold = uniqueValues[k];
          let p = 1;
          // Getting the list of samples whose values are below threshold
          const prediction = tensorX.gather([featureIndex] as any, 1);
          const predNegativeIndex = prediction.less(tf.scalar(threshold));
          const predMinusOnes = tf.fill(prediction.shape, -1);

          const predLabeledPreds = predMinusOnes
            .where(predNegativeIndex, prediction)
            .squeeze();
          // Sum of weights of misclassified samples
          // w = [0.213, 0.21342] -> y = [1, 2] -> prediction = [2, 2] ->
          // any index that has -1 -> grab them from w and get a sum of them

          let error: number = [
            ...// .where(tf.notEqual(tensorY, prediction), tf.zeros([nSamples]), w)
            w
              .where(
                tf.notEqual(tensorY, predLabeledPreds),
                tf.zeros([nSamples])
              )
              .sum()
              .dataSync()
          ][0];

          // If error is over 50%, flip the polarity so that
          // samples that were classified as 0 are classified as 1
          // E.g error = 0.8 => (1 - error) = 0.2
          if (error > 0.5) {
            error = 1 - error;
            p = -1;
          }

          // If the thresh hold resulted in the smallest error, then save the
          // configuration
          if (error < minError) {
            clf.polarity = p;
            clf.threshold = threshold;
            clf.featureIndex = i;
            minError = error;
          }
        }
      }

      // Calculate alpha that is used to update sample weights
      // Alpha is also an approximation of the classifier's proficiency
      clf.alpha = 0.5 * Math.log((1.0 - minError) / (minError + 1e-10));

      // Set all predictions to 1 initially then extracts into a pure array
      const predictions = tf.ones(tensorY.shape);
      const minusOnes = tf.fill(tensorY.shape, -1);
      // The indexes where the sample values are below threshold
      const negativeIndex = tensorX
        // X[:, indices]
        .gather([clf.featureIndex] as any, 1)
        // * polarity
        .mul(clf.getTsPolarity())
        // < polarity * threshold
        .less(clf.getTsPolarity().mul(clf.getTsThreshold()))
        .squeeze();

      // Label those as '-1'
      const labeledPreds = minusOnes.where(negativeIndex, predictions);

      // Misclassified samples gets larger weights and correctly classified samples smaller
      w = w.mul(
        tf
          .scalar(-clf.alpha)
          .mul(tensorY)
          .mul(labeledPreds)
      );

      // Normalize to one
      w = w.div(tf.sum(w));

      // Save the classifier
      this.classifiers.push(clf);
    }
  }

  public fromJSON(state: TypeModelState): void {
    console.info(state);
  }

  public predict(X: Type2DMatrix<number> | Type1DMatrix<number>): number[] {
    const tensorX = tf.tensor2d(X);
    const nSamples = tensorX.shape[0];
    let yPred = tf.zeros([nSamples, 1]);
    const predictions = tf.ones(yPred.shape);
    const minusOnes = tf.fill(yPred.shape, -1);

    for (let i = 0; i < this.classifiers.length; i++) {
      const clf = this.classifiers[i];
      const negativeIndex = clf
        // clf.polarity * X[:, clf.feature_index]
        .getTsPolarity()
        .mul(tensorX.gather([clf.featureIndex] as any, 1))
        // < clf.polarity * clf.threshold
        .less(clf.getTsPolarity().mul(clf.getTsThreshold()));

      // Label those as '-1'
      // const labeledPreds = minusOnes.where(negativeIndex, predictions);
      const labeledPreds = predictions.where(negativeIndex, minusOnes);

      // Add predictions weighted by the classifiers alpha
      // (alpha indicative of classifier's proficiency)
      yPred = yPred.add(tf.scalar(clf.alpha).mul(labeledPreds));
    }

    yPred = tf.sign(yPred).squeeze();
    return [...yPred.dataSync()];
  }

  public toJSON(): TypeModelState {
    return undefined;
  }
}
