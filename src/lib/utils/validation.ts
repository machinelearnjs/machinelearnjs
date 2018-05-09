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
 */
export function checkArray(
  arr: T[any]
): {
  readonly isArray: boolean;
  readonly multiclass: boolean;
} {
  return _.flowRight(
    x => {
      const firstEle = _.get(arr, '[0]');
      if (_.isArray(firstEle)) {
        return _.set(x, 'multiclass', true);
      } else {
        return _.set(x, 'multiclass', false);
      }
    },
    // Check it is an array
    x => {
      if (_.isArray(arr)) {
        return _.set(x, 'isArray', true);
      }
      return _.set(x, 'isArray', false);
    }
  )({});
}
