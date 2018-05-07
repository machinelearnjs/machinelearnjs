import * as _ from 'lodash';
import { checkArray } from "../utils/validation";

/**
 *
 * @param {any} y_true
 * @param {any} y_pred
 * @param {any} normalize
 * @param {any} sample_weight
 */
export function accuracy_score ({
  y_true, y_pred, normalize=true, sample_weight=null
}) {
  // TODO: Multi label
  if (checkArray(y_true).multiclass || checkArray(y_pred).multiclass) {
    throw new Error('Multiclass is not supported yet!');
  }
  if (_.size(y_true) !== _.size(y_pred)) {
    throw new Error('y_true and y_pred are not equal in size!');
  }
  const normalised = _.map(y_true, (_, index) => {
    const yTrue = y_true[index];
    const yPred = y_pred[index];
    return yTrue === yPred ? 1 : 0;
  });

  return _.mean(normalised);
}