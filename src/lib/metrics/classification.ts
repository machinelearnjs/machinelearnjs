import * as _ from 'lodash';
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
  // TODO: Multi label
  if (checkArray(y_true).multiclass || checkArray(y_pred).multiclass) {
    throw new Error('Multiclass is not supported yet!');
  }
  if (_.size(y_true) !== _.size(y_pred)) {
    throw new Error('y_true and y_pred are not equal in size!');
  }
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
