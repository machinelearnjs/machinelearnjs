"use strict";
exports.__esModule = true;
var Random = require("random-js");
var _ = require("lodash");
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
function train_test_split(X, y, test_size, train_size, random_state, shuffle, stratify) {
    if (test_size === void 0) { test_size = 0.2; }
    if (train_size === void 0) { train_size = 0.8; }
    if (random_state === void 0) { random_state = 0; }
    if (shuffle === void 0) { shuffle = false; }
    if (stratify === void 0) { stratify = false; }
    if (_.isEmpty(test_size) && _.isEmpty(train_size)) {
        test_size = 0.25;
        console.warn("test_size and train_size are both empty. Setting test size to 0.25 by default");
    }
    // Training dataset size accoding to X
    var train_size_length = train_size ?
        train_size * X.length :
        (1 - (test_size || 0.2)) * X.length;
    var pure_train_size = _.toInteger(train_size_length);
    // Initiate Random engine
    var randomEngine = Random.engines.mt19937();
    randomEngine.seed(random_state);
    // split
    var train_X = [];
    var train_y = [];
    var test_X = [];
    var test_y = [];
    // Getting train_X and train_y
    while (train_X.length < pure_train_size && train_y.length < pure_train_size) {
        var index = Random.integer(0, pure_train_size - 1)(randomEngine);
        console.log(index);
        // train_X
        train_X.push(X[index]);
        X.splice(index, 1);
        //train_y
        train_y.push(y[index]);
        y.splice(index, 1);
    }
    while (test_X.length < X.length) {
        var index = Random.integer(0, X.length - 1)(randomEngine);
        // train_X
        test_X.push(X[index]);
        X.splice(index, 1);
        //train_y
        test_y.push(y[index]);
        y.splice(index, 1);
    }
    console.log(train_X);
    console.log(train_y);
    console.log(test_X);
    console.log(test_y);
}
exports.train_test_split = train_test_split;
