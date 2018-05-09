"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = __importStar(require("lodash"));
const MathExtra_1 = __importDefault(require("../utils/MathExtra"));
class Imputer {
    /**
     *
     * @param {any} missingValues
     * @param {string} strategy
     * @param {number} axis   0 = column axis & 1 = row axis
     * @param {number} verbose
     * @param {boolean} copy
     */
    constructor({ missingValues = null, strategy = 'mean', axis = 0, verbose = 0, copy = false }) {
        /**
         * Calculate array of numbers as array of mean values
         * Examples:
         * [ [ 1, 2 ], [ null, 3 ], [ 123, 3 ] ]
         * => [ 1.5, 3, 63 ]
         *
         * [ [ 1, 123 ], [ 2, 3, 3 ] ]
         * => [ 62, 2.6666666666666665 ]
         *
         * @param matrix
         * @param {Array<string>} steps
         */
        this.calcArrayMean = (matrix, steps) => _.reduce(steps, (result, step) => {
            switch (step) {
                case 'flatten':
                    return _.map(result, _.flatten);
                case 'filter':
                    return _.map(result, 
                    // Expecting any type of matrics array
                    // TODO: implement a correct type
                    (arr) => {
                        return _.filter(arr, z => z !== this.missingValues);
                    });
                case 'mean':
                    return _.map(result, _.mean);
            }
        }, matrix);
        this.missingValues = missingValues;
        this.strategy = strategy;
        this.axis = axis;
        this.verbose = verbose;
        this.copy = copy;
        this.means = [];
    }
    fit(X) {
        const rowLen = MathExtra_1.default.contrib.size(X, 0);
        const colLen = MathExtra_1.default.contrib.size(X, 1);
        const rowRange = MathExtra_1.default.contrib.range(0, rowLen);
        const colRange = MathExtra_1.default.contrib.range(0, colLen);
        if (this.strategy === 'mean') {
            if (this.axis === 0) {
                const colNumbers = _.map(colRange, col => MathExtra_1.default.subset(X, MathExtra_1.default.index(rowRange, col)));
                this.means = this.calcArrayMean(colNumbers, [
                    'flatten',
                    'filter',
                    'mean'
                ]);
            }
            else if (this.axis === 1) {
                const rowNumbers = _.map(rowRange, row => _.get(X, `[${row}]`));
                this.means = this.calcArrayMean(rowNumbers, ['filter', 'mean']);
            }
        }
        else {
            throw new Error(`Unsupported strategy ${this.strategy} was given`);
        }
    }
    fit_transform(X) {
        const _X = _.clone(X);
        if (this.strategy === 'mean' && this.axis === 0) {
            // Mean column direction transform
            for (let row = 0; row < _.size(_X); row++) {
                for (let col = 0; col < _.size(_X[row]); col++) {
                    const value = _X[row][col];
                    _X[row][col] = value === this.missingValues ? this.means[row] : value;
                }
            }
        }
        else if (this.strategy === 'mean' && this.axis === 1) {
            // Mean row direction transform
            for (let row = 0; row < _.size(_X); row++) {
                for (let col = 0; col < _.size(_X[row]); col++) {
                    const value = _X[row][col];
                    _X[row][col] = value === this.missingValues ? this.means[col] : value;
                }
            }
        }
        else {
            throw new Error(`Unknown transformation with strategy ${this.strategy} and axis ${this.axis}`);
        }
        return _X;
    }
}
exports.Imputer = Imputer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW1wdXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9saWIvcHJlcHJvY2Vzc2luZy9JbXB1dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLDBDQUE0QjtBQUM1QixtRUFBc0M7QUFFdEM7SUFRRTs7Ozs7OztPQU9HO0lBQ0gsWUFBWSxFQUNWLGFBQWEsR0FBRyxJQUFJLEVBQ3BCLFFBQVEsR0FBRyxNQUFNLEVBQ2pCLElBQUksR0FBRyxDQUFDLEVBQ1IsT0FBTyxHQUFHLENBQUMsRUFDWCxJQUFJLEdBQUcsS0FBSyxFQUNiO1FBU0Q7Ozs7Ozs7Ozs7O1dBV0c7UUFDSyxrQkFBYSxHQUFHLENBQUMsTUFBTSxFQUFFLEtBQW9CLEVBQUUsRUFBRSxDQUN2RCxDQUFDLENBQUMsTUFBTSxDQUNOLEtBQUssRUFDTCxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFBRTtZQUNmLFFBQVEsSUFBSSxFQUFFO2dCQUNaLEtBQUssU0FBUztvQkFDWixPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDbEMsS0FBSyxRQUFRO29CQUNYLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FDVixNQUFNO29CQUNOLHNDQUFzQztvQkFDdEMsaUNBQWlDO29CQUNqQyxDQUFDLEdBQWUsRUFBRSxFQUFFO3dCQUNsQixPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztvQkFDdEQsQ0FBQyxDQUNGLENBQUM7Z0JBQ0osS0FBSyxNQUFNO29CQUNULE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2hDO1FBQ0gsQ0FBQyxFQUNELE1BQU0sQ0FDUCxDQUFDO1FBekNGLElBQUksQ0FB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