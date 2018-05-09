"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = __importStar(require("lodash"));
class OneHotEncoder {
    constructor() {
        // NOTE: this is calculating the sample standard deviation (vs population stddev).
        // Shouldn't matter for our purposes as long as it's consistent.
        this.calculateStd = (lst, mean) => {
            const deviations = _.map(lst, (n) => Math.pow(n - mean, 2));
            return Math.pow(_.sum(deviations) / (lst.length - 1), 0.5);
        };
        /**
         * Example usage:
         * boolEncoder.encode(true) => 1
         * boolEncoder.encode(false) => 0
         * @param type
         * @param key
         * @param values
         * @returns {{encode}}
         */
        this.buildBooleanOneHot = (type, key, values) => {
            return {
                encoded: _.map(values, value => (value ? 1 : 0)),
                decode: { type, key }
            };
        };
    }
    /**
     * encode
     *
     * @param data - list of records to encode
     * @param opts - dataKeys: independent variables, labelKeys: dependent variables; mandatory
     * @return {{data: Array, decoders: Array}} - see readme for full explanation
     */
    encode(data, opts = { dataKeys: null, labelKeys: null }) {
        const labelKeys = opts.labelKeys;
        const decoders = [];
        // shortcut to allow caller to default to "all non-label keys are data keys"
        const dataKeys = opts.dataKeys ? opts.dataKeys : _.keys(data[0]);
        // maybe a little too clever but also the simplest;
        // serialize every value for a given data key, then zip the results back up into a (possibly nested) array
        const transform = keys => _.zip(..._.map(keys, key => {
            const standardized = this.standardizeField(key, data);
            const encoded = _.get(standardized, 'encoded');
            const decode = _.get(standardized, 'decode');
            if (encoded && decode) {
                // TODO: We need to prefer immutable datastructure
                decoders.push(decode);
                return encoded;
            }
            // Otherwise just return values itself
            return standardized;
        }));
        const features = transform(dataKeys);
        const labels = transform(labelKeys);
        return {
            // zip the label data back into the feature data (to ensure label data is at the end)
            data: _.map(_.zip(features, labels), _.flattenDeep),
            decoders
        };
    }
    /**
     * decode
     *
     * Transform the encoded data back into its original format
     */
    decode(encoded, decoders) {
        return _.map(encoded, row => this.decodeRow(row, decoders));
    }
    /**
     * decodeRow
     *
     * Transform an encoded row back into its original format
     */
    decodeRow(row, decoders) {
        let i = 0;
        let numFieldsDecoded = 0;
        const record = {};
        while (i < row.length) {
            const decoder = decoders[numFieldsDecoded++];
            record[decoder.key] = getValue(row, i, decoder);
            i += decoder.offset ? decoder.offset : 1;
        }
        return record;
        // Performs the inverse operation of "encode".
        function getValue(row, ix, decoder) {
            switch (decoder.type) {
                case 'string': {
                    const data = row.slice(ix, ix + decoder.offset);
                    return decoder.lookupTable[_.indexOf(data, 1)];
                }
                case 'boolean':
                    return !!row[ix];
                case 'number':
                    return decoder.std * row[ix] + decoder.mean;
                default:
                    return row[ix];
            }
        }
    }
    /**
     * Standardizing field
     * Example dataset:
     * [ { planet: 'mars', isGasGiant: false, value: 10 },
     * { planet: 'saturn', isGasGiant: true, value: 20 },
     * { planet: 'jupiter', isGasGiant: true, value: 30 } ]
     *
     * @param key: each key/feature such as planet, isGasGiant and value
     * @param data: the entire dataset
     * @returns {any}
     */
    standardizeField(key, data) {
        const type = typeof data[0][key];
        const values = _.map(data, key);
        switch (type) {
            case 'string': {
                const result = this.buildStringOneHot(type, key, values);
                return {
                    encoded: result.encoded,
                    decode: result.decode
                };
            }
            case 'number': {
                // Apply std to values if type is number
                // standardize: ((n - mean)/std)
                // TODO: add support for scaling to [0, 1]
                const result = this.buildNumberOneHot(type, key, values);
                return {
                    encoded: result.encoded,
                    decode: result.decode
                };
            }
            case 'boolean': {
                // True == 1
                // False == 0
                const result = this.buildBooleanOneHot(type, key, values);
                return {
                    encoded: result.encoded,
                    decode: result.decode
                };
            }
            default:
                return values;
        }
    }
    /**
     *
     * @param type
     * @param key
     * @param values
     * @returns {{encoded; decode: {type: any; mean: any; std: number; key: any}}}
     */
    buildNumberOneHot(type, key, values) {
        const mean = _.mean(values);
        const std = this.calculateStd(values, mean);
        return {
            encoded: _.map(values, (value) => (value - mean) / std),
            decode: { type, mean, std, key }
        };
    }
    /**
     * Example for internal reference (unnecessary details for those just using this module)
     * const encoder = buildOneHot(['RAIN', 'RAIN', 'SUN'])
     * // encoder == { encode: () => ... , lookupTable: ['RAIN', 'SUN'] }
     * encoder.encode('SUN')  // [0, 1]
     * encoder.encode('RAIN') // [1, 0]
     * encoder.encode('SUN')  // [1, 0]
     * // encoder.lookupTable can then be passed into this.decode to translate [0, 1] back into 'SUN'
     *
     * It's not ideal (ideally it would all just be done in-memory and we could return a "decode" closure,
     * but it needs to be serializable to plain old JSON.
     */
    buildStringOneHot(type, key, values) {
        const lookup = {};
        let i = 0;
        const lookupTable = _.map(_.uniq(values), (value) => {
            _.set(lookup, value, i++);
            return value;
        });
        const encoded = _.map(values, (value) => _.range(0, i).map(pos => (_.get(lookup, value) === pos ? 1 : 0)));
        return {
            encoded,
            decode: {
                key,
                type,
                offset: encoded[0].length,
                lookupTable
            }
        };
    }
}
exports.OneHotEncoder = OneHotEncoder;
class MinMaxScaler {
    constructor({ featureRange = [0, 1] }) {
        this.featureRange = featureRange;
    }
    fit(X) {
        this.dataMax = _.max(X); // What if X is multi-dimensional?
        this.dataMin = _.min(X);
        this.featureMax = this.featureRange[1];
        this.featureMin = this.featureRange[0];
        this.dataRange = this.dataMax - this.dataMin;
        // We need different data range for multi-dimensional
        this.scale = (this.featureMax - this.featureMin) / this.dataRange;
        this.baseMin = this.featureMin - this.dataMin * this.scale;
    }
    fit_transform(X) {
        return X.map(x => x * this.scale).map(x => x + this.baseMin);
    }
}
exports.MinMaxScaler = MinMaxScaler;
class Binarizer {
    constructor({ threshold = 0, copy = true }) {
        this.threshold = threshold;
        this.copy = copy;
    }
    /**
     * Currently fit does nothing
     * @param {Array<any>} X
     */
    fit(X) {
        if (_.isEmpty(X)) {
            throw new Error('X cannot be null');
        }
        console.info("Currently Bianrizer's fit is designed to do nothing");
    }
    /**
     * Transforms matrix into binarized form
     * X = [[ 1., -1.,  2.],
     *      [ 2.,  0.,  0.],
     *      [ 0.,  1., -1.]]
     * becomes
     * array([[ 1.,  0.,  1.],
     *    [ 1.,  0.,  0.],
     *    [ 0.,  1.,  0.]])
     * @param {Array<any>} X
     */
    transform(X) {
        let _X = null;
        if (this.copy) {
            _X = _.clone(X);
        }
        else {
            _X = X;
        }
        if (_.isEmpty(X)) {
            throw new Error('X cannot be null');
        }
        for (let row = 0; row < _.size(X); row++) {
            const rowValue = _.get(X, `[${row}]`);
            for (let column = 0; column < _.size(rowValue); column++) {
                const item = _.get(X, `[${row}][${column}]`);
                // Type checking item; It must be a number type
                if (!_.isNumber(item)) {
                    throw new Error(`Value ${item} is not a number`);
                }
                // If current item is less than
                _X[row][column] = item <= this.threshold ? 0 : 1;
            }
        }
        return _X;
    }
}
exports.Binarizer = Binarizer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9saWIvcHJlcHJvY2Vzc2luZy9kYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLDBDQUE0QjtBQUU1QjtJQUFBO1FBeUlFLGtGQUFrRjtRQUNsRixnRUFBZ0U7UUFDeEQsaUJBQVksR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFZLEVBQUUsRUFBRTtZQUMzQyxNQUFNLFVBQVUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEUsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzdELENBQUMsQ0FBQztRQWtCRjs7Ozs7Ozs7V0FRRztRQUNLLHVCQUFrQixHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUNqRCxPQUFPO2dCQUNMLE9BQU8sRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNoRCxNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFO2FBQ3RCLENBQUM7UUFDSixDQUFDLENBQUM7SUFxQ0osQ0FBQztJQWxOQzs7Ozs7O09BTUc7SUFDSSxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksR0FBRyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRTtRQUM1RCxNQUFN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