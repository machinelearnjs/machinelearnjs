import * as Random from 'random-js';
import * as _ from 'lodash';

/**
 * Split arrays or matrices into random train and test subsets
 * @param {Array<any>} X
 * @param {Array<any>} y
 * @param {Number} test_size
 * @param {Number} train_size
 * @param {Number} random_state
 * @param {boolean} shuffle
 * @param stratify
 * return X_train, y_train, X_test, y_test
 */
export function train_test_split(
  X = [],
  y = [],
  {
    // Options
    test_size = 0.2,
    train_size = 0.8,
    random_state = 0,
    shuffle = false,
    stratify = false
  } = {}
) {
  /* if (_.isEmpty(test_size) && _.isEmpty(train_size)) {
		test_size = 0.25
		console.warn(`test_size and train_size are both empty. Setting test size to 0.25 by default`)
	} */
  // Training dataset size accoding to X
  const train_size_length: number = _.round(train_size * X.length);
  const test_size_length: number = _.round(test_size * X.length);
  // Initiate Random engine
  const randomEngine = Random.engines.mt19937();
  randomEngine.seed(random_state);

  // split
  let X_train = [];
  let y_train = [];
  let X_test = [];
  let y_test = [];

  // Getting X_train and y_train
  while (
    X_train.length < train_size_length &&
    y_train.length < train_size_length
  ) {
    const index = Random.integer(0, X.length - 1)(randomEngine);

    // X_train
    X_train.push(X[index]);
    X.splice(index, 1);

    //y_train
    y_train.push(y[index]);
    y.splice(index, 1);
  }

  while (X_test.length < test_size_length) {
    const index = Random.integer(0, X.length - 1)(randomEngine);
    // X_train
    X_test.push(X[index]);
    X.splice(index, 1);

    //y_train
    y_test.push(y[index]);
    y.splice(index, 1);
  }
  return {
    X_train,
    y_train,
    X_test,
    y_test
  };
}
