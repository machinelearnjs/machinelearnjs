import * as _ from 'lodash';

interface StringOneHotDecoder {
  key: number;
  type: string;
  offset: number;
  lookupTable: object;
}

interface StringOneHot {
  encoded: any[];
  decode: StringOneHotDecoder;
}

interface BooleanOneHotDecoder {
  key: number;
  type: string;
}

interface BooleanOneHot {
  encoded: any[];
  decode: BooleanOneHotDecoder;
}

interface NumberOneHotDecoder {
  type: string;
  mean: number;
  std: number;
  key: string;
}

interface NumberOneHot {
  encoded: any[];
  decode: NumberOneHotDecoder;
}

export class OneHotEncoder {
  /**
   * encode
   *
   * @param data - list of records to encode
   * @param opts - dataKeys: independent variables, labelKeys: dependent variables; mandatory
   * @return {{data: Array, decoders: Array}} - see readme for full explanation
   */
  public encode(
    data,
    opts = { dataKeys: null, labelKeys: null }
  ): { data: any[]; decoders: any[] } {
    const labelKeys = opts.labelKeys;
    const decoders = [];

    // shortcut to allow caller to default to "all non-label keys are data keys"
    const dataKeys = opts.dataKeys ? opts.dataKeys : _.keys(data[0]);
    // maybe a little too clever but also the simplest;
    // serialize every value for a given data key, then zip the results back up into a (possibly nested) array
    const transform = (keys: string[]) =>
      _.zip(
        ..._.map(keys, (key: string) => {
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
        })
      );
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
  public decode(encoded, decoders): any[] {
    return _.map(encoded, row => this.decodeRow(row, decoders));
  }

  /**
   * decodeRow
   *
   * Transform an encoded row back into its original format
   */
  public decodeRow(row, decoders): object {
    let i = 0;
    let numFieldsDecoded = 0;
    const record = {};

    const getStrVal = (X, ix, decoder): string => {
      const data = X.slice(ix, ix + decoder.offset);
      return decoder.lookupTable[_.indexOf(data, 1)];
    };

    const getBoolVal = (X, ix): boolean => !!X[ix];

    const getNumbVal = (X, ix, decoder): number => {
      return decoder.std * X[ix] + decoder.mean;
    };

    while (i < row.length) {
      const decoder = decoders[numFieldsDecoded++];
      if (decoder.type === 'string') {
        record[decoder.key] = getStrVal(row, i, decoder);
      } else if (decoder.type === 'number') {
        record[decoder.key] = getNumbVal(row, i, decoder);
      } else if (decoder.type === 'boolean') {
        record[decoder.key] = getBoolVal(row, i);
      } else {
        record[decoder.key] = row[i];
      }
      // record[decoder.key] = getValue(row, i, decoder);
      i += decoder.offset ? decoder.offset : 1;
    }
    return record;
    /*
    // Performs the inverse operation of "encode".
    function getValue(
      X: Array<string | boolean | number>,
      ix: number,
      decoder: any
    ):
      // Currently supported types
      any
    {

      switch (decoder.type) {
        case 'string': {
          const data = X.slice(ix, ix + decoder.offset);
          return decoder.lookupTable[_.indexOf(data, 1)];
        }
        case 'boolean':
          return !!X[ix];
        case 'number':
          return decoder.std * X[ix] + decoder.mean;
        default:
          return X[ix];
      }
    } */
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
  private standardizeField(
    key,
    data
  ): StringOneHot | BooleanOneHot | NumberOneHot | any[] {
    const type = typeof data[0][key];
    const values = _.map(data, key);
    switch (type) {
      case 'string': {
        const result = this.buildStringOneHot(type, key, values);
        return {
          decode: result.decode,
          encoded: result.encoded
        };
      }

      case 'number': {
        // Apply std to values if type is number
        // standardize: ((n - mean)/std)
        // TODO: add support for scaling to [0, 1]
        const result = this.buildNumberOneHot(type, key, values);

        return {
          decode: result.decode,
          encoded: result.encoded
        };
      }

      case 'boolean': {
        // True == 1
        // False == 0
        const result = this.buildBooleanOneHot(type, key, values);

        return {
          decode: result.decode,
          encoded: result.encoded
        };
      }

      default:
        return values;
    }
  }

  // NOTE: this is calculating the sample standard deviation (vs population stddev).
  // Shouldn't matter for our purposes as long as it's consistent.
  private calculateStd = (lst, mean: number) => {
    const deviations = _.map(lst, (n: number) => Math.pow(n - mean, 2));
    return Math.pow(_.sum(deviations) / (lst.length - 1), 0.5);
  };

  /**
   *
   * @param type
   * @param key
   * @param values
   * @returns {{encoded: any[]; decode: {type: any; mean: number; std: number; key: any}}}
   */
  private buildNumberOneHot(type, key, values): NumberOneHot {
    const mean: number = _.mean(values);
    const std = this.calculateStd(values, mean);
    return {
      decode: { type, mean, std, key },
      encoded: _.map(values, (value: number) => (value - mean) / std)
    };
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
  private buildBooleanOneHot(type, key, values): BooleanOneHot {
    return {
      decode: { type, key },
      encoded: _.map(values, value => (value ? 1 : 0))
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
  private buildStringOneHot(type, key, values): StringOneHot {
    const lookup = {};
    let i = 0;

    const lookupTable = _.map(_.uniq(values), (value: string) => {
      _.set(lookup, value, i++);
      return value;
    });

    const encoded = _.map(values, (value: string) =>
      _.range(0, i).map(pos => (_.get(lookup, value) === pos ? 1 : 0))
    );

    return {
      decode: {
        key,
        lookupTable,
        offset: encoded[0].length,
        type
      },
      encoded
    };
  }
}

export class MinMaxScaler {
  private featureRange;
  private dataMax: number;
  private dataMin: number;
  private featureMax: number;
  private featureMin: number;
  private dataRange: number;
  private scale: number;
  private baseMin: number;

  constructor({ featureRange = [0, 1] }) {
    this.featureRange = featureRange;
  }

  public fit(X: number[]): void {
    this.dataMax = _.max(X); // What if X is multi-dimensional?
    this.dataMin = _.min(X);
    this.featureMax = this.featureRange[1];
    this.featureMin = this.featureRange[0];
    this.dataRange = this.dataMax - this.dataMin;
    // We need different data range for multi-dimensional
    this.scale = (this.featureMax - this.featureMin) / this.dataRange;
    this.baseMin = this.featureMin - this.dataMin * this.scale;
  }

  public fit_transform(X: number[]): any[] {
    return X.map(x => x * this.scale).map(x => x + this.baseMin);
  }
}

export class Binarizer {
  private threshold: number;
  private copy: boolean;

  constructor({ threshold = 0, copy = true }) {
    this.threshold = threshold;
    this.copy = copy;
  }

  /**
   * Currently fit does nothing
   * @param {any[]} X
   */
  public fit(X: any[]): void {
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
   * @param {any[]} X
   */
  public transform(X: any[]): any[] {
    let _X = null;
    if (this.copy) {
      _X = _.clone(X);
    } else {
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
