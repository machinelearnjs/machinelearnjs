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
      _.zip(..._.map(keys, key => this.standardizeField(key, data, decoders)));

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
	 * @param decoders: returned decoder
	 * @returns {any}
	 */
  private standardizeField(key, data, decoders = []) {
    const type = typeof data[0][key];
    const values = _.map(data, key);

    // NOTE: this is calculating the sample standard deviation (vs population stddev).
    // Shouldn't matter for our purposes as long as it's consistent.
    const calculateStd = (lst, mean) => {
      const deviations = _.map(lst, n => Math.pow(n - mean, 2));
      return Math.pow(_.sum(deviations) / (lst.length - 1), 0.5);
    };

    switch (type) {
      case 'string': {
        const oneHotEncoder = this.buildStringOneHot(values);
        const encoded = _.map(values, oneHotEncoder.encode);
        // TODO: Let's prefer immutable datastructure
        decoders.push({
          key,
          type,
          offset: encoded[0].length,
          lookupTable: oneHotEncoder.lookupTable
        });
        return encoded;
      }

      case 'number': {
        // Apply std to values if type is number
        // standardize: ((n - mean)/std)
        // TODO: add support for scaling to [0, 1]
        const mean = _.mean(values);
        const std = calculateStd(values, mean);
        decoders.push({ type, mean, std, key });
        return _.map(values, value => (value - mean) / std);
      }

      case 'boolean': {
        // True == 1
        // False == 0
        decoders.push({ type, key });
        const oneHotEncoder = this.buildBooleanOneHot();
        return oneHotEncoder.encode(values);
      }

      default:
        return values;
    }
  }

	/**
   * Example usage:
   * boolEncoder.encode(true) => 1
   * boolEncoder.encode(false) => 0
	 * @returns {{encode: ((values?) => any)}}
	 */
  private buildBooleanOneHot = () => {
    return {
      encode: values => _.map(values, value => (value ? 1 : 0))
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
  private buildStringOneHot(list) {
    const lookup = {};
    let i = 0;

    const lookupTable = _.map(_.uniq(list), value => {
      lookup[value] = i++;
      return value;
    });

    return {
      lookupTable,
      encode: value => _.range(0, i).map(pos => (lookup[value] === pos ? 1 : 0))
    };
  }
}
