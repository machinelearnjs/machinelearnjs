import * as _ from 'lodash';
import * as Random from 'random-js';

export class KFold {
  public k: number;
  public shuffle: boolean;
  public randomState: number | null;

  constructor({ k = 2, shuffle = false, randomState = null }) {
    this.k = k;
    this.shuffle = shuffle;
    this.randomState = randomState;
  }

  public split(X): any[] {
    const binSize = _.floor(_.size(X) / this.k);
    const xRange = _.range(0, _.size(X));
    const splitRange = _.range(0, this.k);
    return _.reduce(
      splitRange,
      (sum, index) => {
        // Calculate binSizeRange according to k value. e.g. 0 -> [0,1]. 1 -> [2, 3].
        const binSizeRange = _.range(
          index * binSize,
          index * binSize + binSize
        );
        // X index range used for test set. It can either be shuffled e.g. [ 2, 0, 1 ] or raw value [ 0, 1, 2 ]
        const testXRange = _.flowRight(
          x => (this.shuffle ? _.shuffle(x) : x),
          () => _.clone(xRange)
        )();
        // Getting testIndex according to binSizeRange from testXRange
        const testIndex = _.reduce(
          binSizeRange,
          (xIndeces, i) => {
            return _.concat(xIndeces, [testXRange[i]]);
          },
          []
        );
        const trainIndex = _.pullAll(_.clone(xRange), testIndex);
        return _.concat(sum, [{ trainIndex, testIndex }]);
      },
      []
    );
  }
}

/**
 * Split arrays or matrices into random train and test subsets
 * @param {any[]} X
 * @param {any[]} y
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
    random_state = 0
    // shuffle = false,
    // stratify = false
  } = {}
): {
  xTest: any[];
  xTrain: any[];
  yTest: any[];
  yTrain: any[];
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

  while (xTest.length < testSizeLength) {
    const index = Random.integer(0, X.length - 1)(randomEngine);
    // X test
    xTest.push(X[index]);
    X.splice(index, 1);

    // y train
    yTest.push(y[index]);
    y.splice(index, 1);
  }
  return {
    xTest,
    xTrain,
    yTest,
    yTrain
  };
}
