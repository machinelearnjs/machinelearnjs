"use strict";
exports.__esModule = true;
var _ = require("lodash");
var OneHotEncoder = /** @class */ (function () {
    function OneHotEncoder() {
        // NOTE: this is calculating the sample standard deviation (vs population stddev).
        // Shouldn't matter for our purposes as long as it's consistent.
        this.calculateStd = function (lst, mean) {
            var deviations = _.map(lst, function (n) { return Math.pow(n - mean, 2); });
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
        this.buildBooleanOneHot = function (type, key, values) {
            return {
                encoded: _.map(values, function (value) { return (value ? 1 : 0); }),
                decode: { type: type, key: key }
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
    OneHotEncoder.prototype.encode = function (data, opts) {
        var _this = this;
        if (opts === void 0) { opts = { dataKeys: null, labelKeys: null }; }
        var labelKeys = opts.labelKeys;
        var decoders = [];
        // shortcut to allow caller to default to "all non-label keys are data keys"
        var dataKeys = opts.dataKeys ? opts.dataKeys : _.keys(data[0]);
        // maybe a little too clever but also the simplest;
        // serialize every value for a given data key, then zip the results back up into a (possibly nested) array
        var transform = function (keys) {
            return _.zip.apply(_, _.map(keys, function (key) {
                var standardized = _this.standardizeField(key, data);
                var encoded = _.get(standardized, 'encoded');
                var decode = _.get(standardized, 'decode');
                if (encoded && decode) {
                    // TODO: We need to prefer immutable datastructure
                    decoders.push(decode);
                    return encoded;
                }
                // Otherwise just return values itself
                return standardized;
            }));
        };
        var features = transform(dataKeys);
        var labels = transform(labelKeys);
        return {
            // zip the label data back into the feature data (to ensure label data is at the end)
            data: _.map(_.zip(features, labels), _.flattenDeep),
            decoders: decoders
        };
    };
    /**
     * decode
     *
     * Transform the encoded data back into its original format
     */
    OneHotEncoder.prototype.decode = function (encoded, decoders) {
        var _this = this;
        return _.map(encoded, function (row) { return _this.decodeRow(row, decoders); });
    };
    /**
     * decodeRow
     *
     * Transform an encoded row back into its original format
     */
    OneHotEncoder.prototype.decodeRow = function (row, decoders) {
        var i = 0;
        var numFieldsDecoded = 0;
        var record = {};
        while (i < row.length) {
            var decoder = decoders[numFieldsDecoded++];
            record[decoder.key] = getValue(row, i, decoder);
            i += decoder.offset ? decoder.offset : 1;
        }
        return record;
        // Performs the inverse operation of "encode".
        function getValue(row, ix, decoder) {
            switch (decoder.type) {
                case 'string': {
                    var data = row.slice(ix, ix + decoder.offset);
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
    };
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
    OneHotEncoder.prototype.standardizeField = function (key, data) {
        var type = typeof data[0][key];
        var values = _.map(data, key);
        switch (type) {
            case 'string': {
                var result = this.buildStringOneHot(type, key, values);
                return {
                    encoded: result.encoded,
                    decode: result.decode
                };
            }
            case 'number': {
                // Apply std to values if type is number
                // standardize: ((n - mean)/std)
                // TODO: add support for scaling to [0, 1]
                var result = this.buildNumberOneHot(type, key, values);
                return {
                    encoded: result.encoded,
                    decode: result.decode
                };
            }
            case 'boolean': {
                // True == 1
                // False == 0
                var result = this.buildBooleanOneHot(type, key, values);
                return {
                    encoded: result.encoded,
                    decode: result.decode
                };
            }
            default:
                return values;
        }
    };
    /**
   *
     * @param type
     * @param key
     * @param values
     * @returns {{encoded; decode: {type: any; mean: any; std: number; key: any}}}
     */
    OneHotEncoder.prototype.buildNumberOneHot = function (type, key, values) {
        var mean = _.mean(values);
        var std = this.calculateStd(values, mean);
        return {
            encoded: _.map(values, function (value) { return (value - mean) / std; }),
            decode: { type: type, mean: mean, std: std, key: key }
        };
    };
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
    OneHotEncoder.prototype.buildStringOneHot = function (type, key, values) {
        var lookup = {};
        var i = 0;
        var lookupTable = _.map(_.uniq(values), function (value) {
            _.set(lookup, value, i++);
            return value;
        });
        var encoded = _.map(values, function (value) { return _.range(0, i).map(function (pos) { return (_.get(lookup, value) === pos ? 1 : 0); }); });
        return {
            encoded: encoded,
            decode: {
                key: key,
                type: type,
                offset: encoded[0].length,
                lookupTable: lookupTable
            }
        };
    };
    return OneHotEncoder;
}());
exports.OneHotEncoder = OneHotEncoder;
var MinMaxScaler = /** @class */ (function () {
    function MinMaxScaler(_a) {
        var _b = _a.featureRange, featureRange = _b === void 0 ? [0, 1] : _b;
        this.featureRange = featureRange;
    }
    MinMaxScaler.prototype.fit = function (X) {
        this.dataMax = _.max(X); // What if X is multi-dimensional?
        this.dataMin = _.min(X);
        this.featureMax = this.featureRange[1];
        this.featureMin = this.featureRange[0];
        this.dataRange = this.dataMax - this.dataMin;
        // We need different data range for multi-dimensional
        this.scale = (this.featureMax - this.featureMin) / this.dataRange;
        this.baseMin = this.featureMin - this.dataMin * this.scale;
    };
    MinMaxScaler.prototype.fit_transform = function (X) {
        var _this = this;
        return X
            .map(function (x) { return x * _this.scale; })
            .map(function (x) { return x + _this.baseMin; });
    };
    return MinMaxScaler;
}());
exports.MinMaxScaler = MinMaxScaler;
