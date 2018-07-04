import * as _ from 'lodash';
import math from '../utils/MathExtra';
import { checkArray } from '../utils/validation';

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
 * @ignore
 * Validator for classification exceptions
 * @param y_true
 * @param y_pred
 * @param labels
 * @param options
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
    const yTrueCls = _.flowRight(x => _.sortBy(x, y => y), x => _.uniq(x))(y_true);

    const yPredCls = _.flowRight(x => _.sortBy(x, y => y), x => _.uniq(x))(y_pred);

    const sortedLabels = _.sortBy(labels, x => x);
    if (!_.isEqual(sortedLabels, yTrueCls) || !_.isEqual(sortedLabels, yPredCls)) {
      throw new Error('Labels must match the classes');
    }
  }
};

/**
 *
 * @param {any} y_true
 * @param {any} y_pred
 * @param {any} normalize
 * @param {any} sample_weight
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

  // Mutable zeros to contain matrix values
  let zerosPlaceholder = JSON.parse(placeholder);

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

          if (_.isEqual(trueVal, yTargetTrueVal) && _.isEqual(predVal, yTargetPredVal)) {
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
