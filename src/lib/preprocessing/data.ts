import * as _ from 'lodash';

export class OneHotEncoder {
  /**
   * encode
   *
   * @param data - list of records to encode
   * @param opts - dataKeys: independent variables, labelKeys: dependent variables; mandatory
   * @return {{data: Array, decoders: Array}} - see readme for full explanation
   */
  public encode(data, opts = { dataKeys: null, labelKeys: null }) {
    const labelKeys = opts.labelKeys;
    const decoders = [];

    // shortcut to allow caller to default to "all non-label keys are data keys"
    const dataKeys = opts.dataKeys ? opts.dataKeys : _.keys(data[0]);
    // maybe a little too clever but also the simplest;
    // serialize every value for a given data key, then zip the results back up into a (possibly nested) array
    const transform = keys =>
      _.zip(..._.map(keys, key => {
        const standardized = this.standardizeField(key, data);

        const encoded = _.get(standardized, 'encoded');
        const decode = _.get(standardized, 'decode');
        if (encoded && decode) {
          // TODO: We need to prefer immutable datastructure
          decoders.push(standardized.decode);
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
  public decode(encoded, decoders) {
    return _.map(encoded, row => this.decodeRow(row, decoders));
  }

  /**
   * decodeRow
   *
   * Transform an encoded row back into its original format
   */
  public decodeRow(row, decoders) {
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
  private standardizeField(key, data) {
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
        }
      }

      case 'boolean': {
        // True == 1
        // False == 0
        const result = this.buildBooleanOneHot(type, key, values);

        return {
          encoded: result.encoded,
          decode: result.decode
        }
      }

      default:
        return values;
    }
  }

  // NOTE: this is calculating the sample standard deviation (vs population stddev).
  // Shouldn't matter for our purposes as long as it's consistent.
  private calculateStd = (lst, mean) => {
    const deviations = _.map(lst, n => Math.pow(n - mean, 2));
    return Math.pow(_.sum(deviations) / (lst.length - 1), 0.5);
  };

	/**
   *
	 * @param type
	 * @param key
	 * @param values
	 * @returns {{encoded; decode: {type: any; mean: any; std: number; key: any}}}
	 */
  private buildNumberOneHot(type, key, values) {
    const mean = _.mean(values);
    const std = this.calculateStd(values, mean);
    return {
      encoded: _.map(values, value => (value - mean) / std),
      decode: { type, mean, std, key },
    }
  }

	/**
   * Example usage:
   * boolEncoder.encode(true) => 1
   * boolEncoder.encode(false) => 0
	 * @param type
	 * @param key
	 * @param values
	 * @returns {{encode}}
	 */
  private buildBooleanOneHot = (type, key, values) => {
    return {
      encoded: _.map(values, value => (value ? 1 : 0)),
      decode: { type, key }
    }
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
  private buildStringOneHot(type, key, values) {
    const lookup = {};
    let i = 0;

    const lookupTable = _.map(_.uniq(values), value => {
      lookup[value] = i++;
      return value;
    });

    const encoded = _.map(
      values, value => _.range(0, i).map(pos => (lookup[value] === pos ? 1 : 0)))

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
