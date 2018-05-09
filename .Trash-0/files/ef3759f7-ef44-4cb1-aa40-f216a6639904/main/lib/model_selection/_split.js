"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Random = __importStar(require("random-js"));
const _ = __importStar(require("lodash"));
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
function train_test_split(X = [], y = [], { 
// Options
test_size = 0.2, train_size = 0.8, random_state = 0, shuffle = false, stratify = false } = {}) {
    /* if (_.isEmpty(test_size) && _.isEmpty(train_size)) {
          test_size = 0.25
          console.warn(`test_size and train_size are both empty. Setting test size to 0.25 by default`)
      } */
    // Training dataset size accoding to X
    const train_size_length = _.round(train_size * X.length);
    const test_size_length = _.round(test_size * X.length);
    // Initiate Random engine
    const randomEngine = Random.engines.mt19937();
    randomEngine.seed(random_state);
    // split
    let X_train = [];
    let y_train = [];
    let X_test = [];
    let y_test = [];
    // Getting X_train and y_train
    while (X_train.length < train_size_length &&
        y_train.length < train_size_length) {
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
exports.train_test_split = train_test_split;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX3NwbGl0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpYi9tb2RlbF9zZWxlY3Rpb24vX3NwbGl0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLGtEQUFvQztBQUNwQywwQ0FBNEI7QUFFNUI7Ozs7Ozs7Ozs7R0FVRztBQUNILDBCQUNFLENBQUMsR0FBRyxFQUFFLEVBQ04sQ0FBQyxHQUFHLEVBQUUsRUFDTjtBQUNFLFVBQVU7QUFDVixTQUFTLEdBQUcsR0FBRyxFQUNmLFVBQVUsR0FBRyxHQUFHLEVBQ2hCLFlBQVksR0FBRyxDQUFDLEVBQ2hCLE9BQU8sR0FBRyxLQUFLLEVBQ2YsUUFBUSxHQUFHLEtBQUssRUFDakIsR0FBRyxFQUFFO0lBRU47OztVQUdHO0lBQ0gsc0NBQXNDO0lBQ3RDLE1BQU0saUJBQWlCLEdBQVcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2pFLE1BQU0sZ0JBQWdCLEdBQVcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQy9ELHlCQUF5QjtJQUN6QixNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQzlDLFlBQVksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7SUFFaEMsUUFBUTtJQUNSLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztJQUNqQixJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7SUFDakIsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO0lBQ2hCLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUVoQiw4QkFBOEI7SUFDOUIsT0FDRSxPQUFPLENBQUMsTUFBTSxHQUFHLGlCQUFpQjtRQUNsQyxPQUFPLENBQUMsTUFBTSxHQUFHLGlCQUFpQixFQUNsQztRQUNBLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFNUQsVUFBVTtRQUNWLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDdkIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFbkIsU0FBUztRQUNULE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDdkIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDcEI7SUFFRCxPQUFPLE1BQU0sQ0FBQyxNQUFNLEdBQUcsZ0JBQWdCLEVBQUU7UUFDdkMsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUM1RCxVQUFVO1FBQ1YsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUN0QixDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztRQUVuQixTQUFTO1FBQ1QsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUN0QixDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztLQUNwQjtJQUNELE9BQU87UUFDTCxPQUFPO1FBQ1AsT0FBTztRQUNQLE1BQU07UUFDTixNQUFNO0tBQ1AsQ0FBQztBQUNKLENBQUM7QUE3REQsNENBNkRDIn0=