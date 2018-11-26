import * as tf from '@tensorflow/tfjs';
import * as _ from 'lodash';
import math from '../utils/MathExtra';
import { checkArray } from '../utils/validation';

/**
 * util function to calculate a weighted sum
 * @param {any} sampleScore
 * @param {any} normalize
 * @returns {number}
 * @ignore
 */
function _weightedSum({
  sampleScore,
  // sampleWeight = null,
  normalize = false
}): number {
  if (normalize) {
    return _.mean(sampleScore);
  } else {
    return _.sum(sampleScore);
  }
}

/**
 * Validator for classification exceptions
 * @param y_true
 * @param y_pred
 * @param labels
 * @param options
 * @ignore
 */
export const validateInitialInputs = (y_true, y_pred, labels, options = {}) => {
  const checkMultiClass = _.get(options, 'multiclass');

  // Multiclass
  if (checkMultiClass) {
    // TODO: Multi label
    if (checkArray(y_true).multiclass || checkArray(y_pred).multiclass) {
      throw new Error('Multiclass is not supported yet!');
    }
  }

  // Checking nullity or empty
  if (!y_true || _.isEmpty(y_true)) {
    throw new Error('y_true cannot be null or empty');
  }
  if (!y_pred || _.isEmpty(y_pred)) {
    throw new Error('y_pred cannot be null or empty');
  }

  // Checking the size equality
  if (_.size(y_true) !== _.size(y_pred)) {
    throw new Error('y_true and y_pred are not equal in size!');
  }

  // Checking labels equal to both y_true and y_pred classes
  // Labels is optional
  if (labels) {
    const yTrueCls = _.flowRight(
      x => _.sortBy(x, y => y),
      x => _.uniq(x)
    )(y_true);

    const yPredCls = _.flowRight(
      x => _.sortBy(x, y => y),
      x => _.uniq(x)
    )(y_pred);

    const sortedLabels = _.sortBy(labels, x => x);
    if (
      !_.isEqual(sortedLabels, yTrueCls) ||
      !_.isEqual(sortedLabels, yPredCls)
    ) {
      throw new Error('Labels must match the classes');
    }
  }
};

/**
 * Accuracy classification score.
 *
 * In multilabel classification, this function computes subset accuracy:
 * the set of labels predicted for a sample must exactly match the corresponding set of labels in y_true.
 *
 * @example
 * import { accuracyScore } from 'kalimdor/metrics';
 *
 * const accResult = accuracyScore({
 *   y_true: [0, 1, 2, 3],
 *   y_pred: [0, 2, 1, 3]
 * });
 *
 * // accuracy result: 0.5
 *
 * @param {any} y_true
 * @param {any} y_pred
 * @param {any} normalize
 */
export function accuracyScore({
  y_true,
  y_pred,
  normalize = true
  // sample_weight = null
}): // TODO: Fix any array type
number {
  validateInitialInputs(y_true, y_pred, null, { multiclass: true });

  const yTrueRange = _.range(0, _.size(y_true));
  const normalised = _.map(yTrueRange, index => {
    const yTrue = y_true[index];
    const yPred = y_pred[index];
    return yTrue === yPred ? 1 : 0;
  });

  return _weightedSum({
    normalize,
    sampleScore: normalised
  });
}

/**
 * Zero-one classification loss.
 *
 * If normalize is `true`, return the fraction of misclassifications (float),
 * else it returns the number of misclassifications (int). The best performance is 0.
 *
 * @example
 * import { zeroOneLoss } from 'kalimdor/metrics';
 *
 * const loss_zero_one_result = zeroOneLoss({
 *   y_true: [1, 2, 3, 4],
 *   y_pred: [2, 2, 3, 5]
 * });
 * console.log(loss_zero_one_result); // 0.5
 *
 * @param {any} y_true
 * @param {any} y_pred
 * @param {any} normalize
 * @returns {number}
 */
export function zeroOneLoss({
  y_true,
  y_pred,
  normalize = true
  // sample_weight = null
}): number {
  if (normalize) {
    return 1 - accuracyScore({ y_true, y_pred });
  }
  // TODO: Fix return 0; implement when normalize === false
  return 0;
}

export interface ConfusionMatrixOptions {
  /**
   * Ground truth (correct) target values.
   */
  y_true: any[];
  /**
   * Estimated targets as returned by a classifier.
   */
  y_pred: any[];
  /**
   * List of labels to index the matrix. This may be used to reorder or
   * select a subset of labels. If none is given, those that appear
   * at least once in y_true or y_pred are used in sorted order.
   */
  labels?: any[];
}

/**
 * A confusion matrix is a technique for summarizing the performance of a classification algorithm.
 *
 * Classification accuracy alone can be misleading if you have an unequal number of observations in each class or if you have more than two classes in your dataset.
 *
 * Calculating a confusion matrix can give you a better idea of what your classification model is getting right and what types of errors it is making.
 *
 * @example
 * import { confusion_matrix } from 'kalimdor/metrics';
 *
 * const matrix1 = confusion_matrix({
 *   y_true: [1, 2, 3],
 *   y_pred: [1, 2, 3]
 * });
 * console.log(matrix1); // [ [ 1, 0, 0 ], [ 0, 1, 0 ], [ 0, 0, 1 ] ]
 *
 * const matrix2 = confusion_matrix({
 *   y_true: ['cat', 'ant', 'cat', 'cat', 'ant', 'bird'],
 *   y_pred: ['ant', 'ant', 'cat', 'cat', 'ant', 'cat']
 * });
 * console.log(matrix2); // [ [ 1, 2, 0 ], [ 2, 0, 0 ], [ 0, 1, 0 ] ]
 *
 * @param {ConfusionMatrixOptions} options
 * @returns {number[]}
 */
export function confusion_matrix(options: ConfusionMatrixOptions): number[] {
  const y_true = _.get(options, 'y_true', null);
  const y_pred = _.get(options, 'y_pred', null);
  const labels = _.get(options, 'labels', null);

  validateInitialInputs(y_true, y_pred, labels);

  // TODO: Sorting if set by options
  // TODO: classes should be based on yTrue
  const yTrueCls = _.uniqBy(y_true, x => x);
  const yPredCls = _.uniqBy(y_pred, x => x);

  // TODO: Issue was raisen to fix the typing: https://github.com/josdejong/mathjs/issues/1150
  const placeholder: any = math.zeros(_.size(yTrueCls), _.size(yTrueCls));
  tf.zeros([2, 3]).dataSync();
  tf.zeros([2, 3]).print();
  console.log('yTruecls', _.size(yTrueCls), ' yprescls ', _.size(yPredCls), JSON.parse(placeholder));
  // console.log(tf.zeros());
  // Mutable zeros to contain matrix values
  const zerosPlaceholder = JSON.parse(placeholder);

  // Calculating the confusion matrix
  // Looping the index for y_true
  const rowRange = _.range(0, _.size(zerosPlaceholder));
  _.forEach(rowRange, rowIndex => {
    // Looping the index for y_pred
    const colRange = _.range(0, _.size(zerosPlaceholder[rowIndex]));
    _.forEach(colRange, colIndex => {
      // Get current target y true and y pred
      const yTargetTrueVal = yTrueCls[rowIndex];
      const yTargetPredVal = yPredCls[colIndex];

      // Looping the range of y true for pairing
      const yTrueRange = _.range(0, _.size(y_true));
      const score = _.reduce(
        yTrueRange,
        (sum, n) => {
          const trueVal = y_true[n];
          const predVal = y_pred[n];

          if (
            _.isEqual(trueVal, yTargetTrueVal) &&
            _.isEqual(predVal, yTargetPredVal)
          ) {
            return sum + 1;
          }
          return sum;
        },
        0
      );

      // Recording the score
      zerosPlaceholder[rowIndex][colIndex] = score;
    });
  });

  return zerosPlaceholder;
}
