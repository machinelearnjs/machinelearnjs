/* Original code from:
 * https://gist.github.com/wassname/a882ac3981c8e18d2556
 * Minor updates has been made to pass TSLint and TSDoc checks
 */
import * as _ from 'lodash';

/**
 * Generate all combination of arguments from objects
 * @param optObj - An object or arrays with keys describing options  {firstName:['Ben','Jade','Darren'],lastName:['Smith','Miller']}
 * @private
 * @return - An array of objects e.g. [{firstName:'Ben',LastName:'Smith'},{..]
 * @ignore
 */
function _cartesianProductObj(optObj): any[] {
  const keys = _.keys(optObj);
  const opts = _.values(optObj);
  const combs = _cartesianProductOf(opts);
  return _.map(combs, (comb) => {
    return _.zipObject(keys, comb);
  });
}

/**
 * Generate all combination of arguments when given arrays or strings
 * e.g. [['Ben','Jade','Darren'],['Smith','Miller']] to [['Ben','Smith'],[..]]
 * e.g. 'the','cat' to [['t', 'c'],['t', 'a'], ...]
 * @param args
 * @private
 * @ignore
 */
function _cartesianProductOf(args): any[] {
  let _args = args;
  if (arguments.length > 1) {
    _args = _.toArray(arguments);
  }

  // strings to arrays of letters
  _args = _.map(_args, (opt) => (typeof opt === 'string' ? _.toArray(opt) : opt));
  return _.reduce(
    _args,
    (a, b) => {
      return _.flatten(
        _.map(a, (x) => {
          return _.map(b, (y) => {
            return _.concat(x, [y]);
          });
        }),
      );
    },
    [[]],
  );
}

/**
 * Generate the cartesian product of input objects, arrays, or strings
 *
 *
 * product('me','hi')
 * // => [["m","h"],["m","i"],["e","h"],["e","i"]]
 *
 * product([1,2,3],['a','b','c']
 * // => [[1,"a"],[1,"b"],[1,"c"],[2,"a"],[2,"b"],[2,"c"],[3,"a"],[3,"b"],[3,"c"]]
 *
 * product({who:['me','you'],say:['hi','by']})
 * // => [{"who":"me","say":"hi"},{"who":"me","say":"by"},{"who":"you","say":"hi"},{"who":"you","say":"by"}]
 *
 * // It also takes in a single array of args
 * product(['me','hi'])
 * // => [["m","h"],["m","i"],["e","h"],["e","i"]]
 * @ignore
 */
function product(opts): any[] {
  if (arguments.length === 1 && !_.isArray(opts)) {
    return _cartesianProductObj(opts);
  } else if (arguments.length === 1) {
    return _cartesianProductOf(opts);
  } else {
    return _cartesianProductOf(arguments);
  }
}

/**
 * Generate n combinations with repeat values.
 * @param X - Matrix input
 * @param n - number of repeats
 * @ignore
 */
export function combinationsWithReplacement(X, n?: number): number[][] {
  let _n = n;
  let _X = X;
  if (typeof _X === 'string') {
    _X = _.toArray(_X);
  }

  // If repeat is 1, simply return the original value
  if (_n === 0) {
    return null;
  }
  if (_n === 1) {
    return X;
  }

  // Falls back to X.length as default value is _n is undefined
  _n = _n ? _n : X.length;
  // make n copies of keys/indices
  const nInds = [];
  for (let j = 0; j < _n; j++) {
    nInds.push(_.keys(_X));
  }
  // get product of the indices, then filter to keep elements in order
  const arrangements = product(nInds).filter((pair) => pair[0] <= pair[1]);
  return _.map(arrangements, (indices) => _.map(indices, (i) => _X[i]));
}
