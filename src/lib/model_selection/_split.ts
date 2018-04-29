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
 * return train_X, train_y, test_X, test_y
 */
export function train_test_split(
	X: Array<any>,
	y: Array<any>,
	test_size:number = 0.2,
	train_size:number = 0.8,
	random_state:number = 0,
	shuffle: boolean = false,
	stratify: any = false
) {
	if (_.isEmpty(test_size) && _.isEmpty(train_size)) {
		test_size = 0.25
		console.warn(`test_size and train_size are both empty. Setting test size to 0.25 by default`)
	}
	// Training dataset size accoding to X
	const train_size_length:number = train_size ?
		train_size * X.length :
		(1 - (test_size || 0.2)) * X.length;
	const pure_train_size:number = _.toInteger(train_size_length);
	// Initiate Random engine
	const randomEngine = Random.engines.mt19937();
	randomEngine.seed(random_state);

	// split
	let train_X = [];
	let train_y = [];
	let test_X = [];
	let test_y = [];

	// Getting train_X and train_y
	while (train_X.length < pure_train_size && train_y.length < pure_train_size) {
		const index = Random.integer(0, pure_train_size - 1)(randomEngine);
		console.log(index);

		// train_X
		train_X.push(X[index]);
		X.splice(index, 1);

		//train_y
		train_y.push(y[index]);
		y.splice(index, 1);
	}

	while (test_X.length < X.length) {
		const index = Random.integer(0, X.length - 1)(randomEngine);
		// train_X
		test_X.push(X[index]);
		X.splice(index, 1);

		//train_y
		test_y.push(y[index]);
		y.splice(index, 1);
	}
	return {
		train_X,
		train_y,
		test_X,
		test_y
	};
}
