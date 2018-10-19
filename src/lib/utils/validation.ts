import * as _ from 'lodash';

/**
 * Check below array conditions
 * - multiclass
 *    - e.g. [ [1, 2], [2, 3] ]
 *      Then it sets multiclass value to true
 * - isArray<boolean>
 *   If the given arr is an array then the value is true else false
 * @param arr
 * @returns {any}
 * @ignore
 */
export function checkArray(
  arr: any[]
): {
  readonly isArray: boolean;
  readonly multiclass: boolean;
} {
  let result = {
    isArray: false,
    multiclass: false
  };

  // Setting isArray flag
  if (_.isArray(arr)) {
    result = _.set(result, 'isArray', true);
  } else {
    result = _.set(result, 'isArray', false);
  }

  // Setting multiclass flag
  const firstElm = _.get(arr, '[0]');
  if (_.isArray(firstElm)) {
    result = _.set(result, 'multiclass', true);
  } else {
    result = _.set(result, 'multiclass', false);
  }

  return result;
}
