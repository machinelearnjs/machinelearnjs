import * as _ from 'lodash';

export function checkArray(arr) {
  return _.flowRight(
    // Check multiclass
    (x) => {
      const firstEle = _.get(arr, '[0]');
      if (_.isArray(firstEle)) {
        return _.set(x, 'multiclass', true);
      } else {
        return _.get(x,'multiclass', false);
      }
    },
    // Check it is an array
    (x) => {
      if (!_.isArray(arr)) {
        return _.set(x, 'notArray', true);
      }
      return x;
    },
  )({})
}