import * as _ from 'lodash';
import * as Random from 'random-js';

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
): {
  X_test: array<any>;
  X_train: array<any>;
  y_test: array<any>;
  y_train: array<any>;
} {
  /* if (_.isEmpty(test_size) && _.isEmpty(train_size)) {
		test_size = 0.25
		console.warn(`test_size and train_size are both empty. Setting test size to 0.25 by default`)
	} */
  // Training dataset size accoding to X
  const trainSizeLength: number = _.round(train_size * X.length);
  const testSizeLength: number = _.round(test_size * X.length);
  // Initiate Random engine
  const randomEngine = Random.engines.mt19937();
  randomEngine.seed(random_state);

  // split
  const xTrain = [];
  const yTrain = [];
  const xTest = [];
  const yTest = [];

  // Getting X_train and y_train
  while (xTrain.length < trainSizeLength && yTrain.length < trainSizeLength) {
    const index = Random.integer(0, X.length - 1)(randomEngine);

    // X_train
    xTrain.push(X[index]);
    X.splice(index, 1);

    // y_train
    yTrain.push(y[index]);
    y.splice(index, 1);
  }

  while (X_test.length < testSizeLength) {
    const index = Random.integer(0, X.length - 1)(randomEngine);
    // X test
    xTest.push(X[index]);
    X.splice(index, 1);

    // y train
    yTest.push(y[index]);
    y.splice(index, 1);
  }
  return {
    X_test,
    X_train,
    y_test,
    y_train
  };
}
