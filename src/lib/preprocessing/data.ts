import * as _ from 'lodash';
import math from '../utils/MathExtra';
import { combinationsWithReplacement } from '../utils/permutations';

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

/**
 * Augment dataset with an additional dummy feature.
 * This is useful for fitting an intercept term with implementations which cannot otherwise fit it directly.
 *
 * @example
 * import { add_dummy_feature } from 'kalimdor/preprocessing';
 * const dummy = add_dummy_feature({ X: [[0, 1, 2], [1, 0, 3]] });
 * console.log(dummy); // returns: [ [ 1, 0, 1, 2 ], [ 1, 1, 0, 3 ] ]
 *
 * @param X - A matrix of data
 * @param value - Value to use for the dummy feature.
 */
export function add_dummy_feature(
  {
    X = null,
    value = 1.0
  }: {
    X: number[][];
    value?: number;
  } = {
    X: null,
    value: 1.0
  }
): number[][] {
  if (!math.contrib.isMatrix(X)) {
    throw Error('Input must be a matrix');
  }
  const [nSamples] = math.matrix(X).size();
  const ones = JSON.parse(math.ones(nSamples, 1).toString());
  const multipliedOnes = math.multiply(ones, value);
  return math.contrib.hstack(multipliedOnes, X);
}

/**
 * Encode categorical integer features using a one-hot aka one-of-K scheme.
 *
 * The input to this transformer should be a matrix of integers, denoting the
 * values taken on by categorical (discrete) features. The output will be a sparse
 * matrix where each column corresponds to one possible value of one feature.
 * It is assumed that input features take on values in the range [0, n_values).
 *
 * This encoding is needed for feeding categorical data to many
 * scikit-learn estimators, notably linear models and SVMs with the standard kernels.
 *
 * Note: a one-hot encoding of y labels should use a LabelBinarizer instead.
 *
 * @example
 * const enc = new OneHotEncoder();
 * const planetList = [
 *  { planet: 'mars', isGasGiant: false, value: 10 },
 *  { planet: 'saturn', isGasGiant: true, value: 20 },
 *  { planet: 'jupiter', isGasGiant: true, value: 30 }
 * ];
 * const encodeInfo = enc.encode(planetList, {
 *  dataKeys: ['value', 'isGasGiant'],
 *  labelKeys: ['planet']
 * });
 * // encodeInfo.data -> [ [ -1, 0, 1, 0, 0 ], [ 0, 1, 0, 1, 0 ], [ 1, 1, 0, 0, 1 ] ]
 * const decodedInfo = enc.decode(encodeInfo.data, encodeInfo.decoders);
 * // gives you back the original value, which is `planetList`
 */
export class OneHotEncoder {
  /**
   * encode data according to dataKeys and labelKeys
   *
   * @param data - list of records to encode
   * @param options - dataKeys: independent variables, labelKeys: dependent variables; mandatory
   * @return {{data: Array, decoders: Array}} - see readme for full explanation
   */
  public encode(
    data,
    options = { dataKeys: null, labelKeys: null }
  ): { data: any[]; decoders: any[] } {
    const labelKeys = options.labelKeys;
    const decoders = [];

    // shortcut to allow caller to default to "all non-label keys are data keys"
    const dataKeys = options.dataKeys ? options.dataKeys : _.keys(data[0]);
    // validations
    if (_.size(data) < 1) {
      throw Error('data cannot be empty!');
    }
    // data keys
    _.forEach(dataKeys, dataKey => {
      // TODO: it's only checking data[0] -> It should also check all the others
      if (!_.has(data[0], dataKey)) {
        // TODO: Find the correct error to throw
        throw Error(`Cannot find ${dataKey} from data`);
      }
    });

    // label keys
    _.forEach(labelKeys, labelKey => {
      // TODO: it's only checking data[0] -> It should also check all the others
      if (!_.has(data[0], labelKey)) {
        // TODO Find the correct error to throw
        throw Error(`Cannot find ${labelKey} from labels`);
      }
    });

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
   * Decode the encoded data back into its original format
   */
  public decode(encoded, decoders): any[] {
    return _.map(encoded, row => this.decodeRow(row, decoders));
  }

  /**
   * Decode an encoded row back into its original format
   * @param row
   * @param decoders
   * @returns {Object}
   */
  private decodeRow(row, decoders): object {
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

  /**
   * Calculating the sample standard deviation (vs population stddev).
   * @param lst
   * @param {number} mean
   * @returns {number}
   */
  private calculateStd = (lst, mean: number) => {
    const deviations = _.map(lst, (n: number) => Math.pow(n - mean, 2));
    return Math.pow(_.sum(deviations) / (lst.length - 1), 0.5);
  };

  /**
   * One hot encode a number value
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
   * One hot encode a boolean value
   *
   * Example usage:
   * boolEncoder.encode(true) => 1
   * boolEncoder.encode(false) => 0
   *
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
   * One hot encode a string value
   *
   * Example for internal reference (unnecessary details for those just using this module)
   *
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

/**
 * Transforms features by scaling each feature to a given range.
 *
 * This estimator scales and translates each feature individually such that it is in the given range on the training set, i.e. between zero and one.
 *
 * The transformation is given by:
 *
 * ```
 * X_std = (X - X.min(axis=0)) / (X.max(axis=0) - X.min(axis=0))
 * X_scaled = X_std * (max - min) + min
 * ```
 *
 * where min, max = feature_range.
 *
 * This transformation is often used as an alternative to zero mean, unit variance scaling.
 *
 * @example
 * import { MinMaxScaler } from 'kalimdor/preprocessing';
 *
 * const minmaxScaler = new MinMaxScaler({ featureRange: [0, 1] });
 * minmaxScaler.fit([4, 5, 6]);
 * const result = minmaxScaler.fit_transform([4, 5, 6]);
 * // [ 0, 0.5, 1 ]
 */
export class MinMaxScaler {
  private featureRange: number[];
  private clone: boolean;
  private dataMax: number;
  private dataMin: number;
  private featureMax: number;
  private featureMin: number;
  private dataRange: number;
  private scale: number;
  private baseMin: number;

  /**
   * @param featureRange - scaling range
   * @param clone - to clone the input
   */
  constructor(
    {
      featureRange = [0, 1],
      clone = true
    }: {
      featureRange?: number[];
      clone?: boolean;
    } = {
      featureRange: [0, 1],
      clone: true
    }
  ) {
    this.featureRange = featureRange;
    this.clone = clone;
  }

  /**
   * Compute the minimum and maximum to be used for later scaling.
   * @param {number[]} X - Array or sparse-matrix data input
   */
  public fit(X: number[] | number[][]): void {
    const clonedX = this.clone ? _.cloneDeep(X) : X;
    let rowMax: any = clonedX;
    let rowMin: any = clonedX;

    // If input is a Matrix...
    if (math.contrib.isMatrix(X)) {
      rowMax = math.max(X, 0);
      rowMin = math.min(X, 0);
    }
    this.dataMax = _.max(rowMax);
    this.dataMin = _.min(rowMin);
    this.featureMax = this.featureRange[1];
    this.featureMin = this.featureRange[0];
    this.dataRange = this.dataMax - this.dataMin;
    // We need different data range for multi-dimensional
    this.scale = (this.featureMax - this.featureMin) / this.dataRange;
    this.baseMin = this.featureMin - this.dataMin * this.scale;
  }

  /**
   * Fit to data, then transform it.
   * @param {number[]} X - Original input vector
   */
  public fit_transform(X: number[]): number[] {
    const X1 = X.map(x => x * this.scale);
    return X1.map(x => x + this.baseMin);
  }

  /**
   * Undo the scaling of X according to feature_range.
   * @param {number[]} X - Scaled input vector
   */
  public inverse_transform(X: number[]): number[] {
    const X1 = X.map(x => x - this.baseMin);
    return X1.map(x => x / this.scale);
  }
}

/**
 * Binarizer transform your data using a binary threshold.
 * All values above the threshold are marked 1 and all equal to or below are marked as 0.
 *
 * It can also be used as a pre-processing step for estimators that consider
 * boolean random variables (e.g. modelled using the Bernoulli distribution in
 * a Bayesian setting).
 *
 * @example
 * import { Binarizer } from 'kalimdor/preprocessing';
 *
 * const binX = [[1, -1, 2], [2, 0, 0], [0, 1, -1]];
 * const binarizer = new Binarizer({ threshold: 0 });
 * const result = binarizer.transform(binX);
 * // [ [ 1, 0, 1 ], [ 1, 0, 0 ], [ 0, 1, 0 ] ]
 */
export class Binarizer {
  private threshold: number;
  private copy: boolean;

  /**
   *
   * @param {number} threshold - Feature values below or equal to this are replaced by 0, above it by 1.
   * @param {boolean} copy - Flag to clone the input value.
   */
  constructor(
    {
      // Each object param default value
      copy = true,
      threshold = 0
    }: {
      // Param types
      copy?: boolean;
      threshold?: number;
    } = {
      // Default value on empty constructor
      copy: true,
      threshold: 0
    }
  ) {
    this.threshold = threshold;
    this.copy = copy;
  }

  /**
   * Currently fit does nothing
   * @param {any[]} X - Does nothing
   */
  public fit(X: any[] = []): void {
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
   * @param {any[]} X - The data to binarize.
   */
  public transform(X: any[] = []): any[] {
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

/**
 * Generate polynomial and interaction features.
 *
 * Generate a new feature matrix consisting of all polynomial combinations of the features
 * with degree less than or equal to the specified degree. For example, if an input sample
 * is two dimensional and of the form [a, b], the degree-2 polynomial features are [1, a, b, a^2, ab, b^2].
 *
 * @example
 * import { PolynomialFeatures } from 'kalimdor/preprocessing';
 * const poly = new PolynomialFeatures();
 * const X = [[0, 1], [2, 3], [4, 5]];
 * poly.transform({ X });
 * // Result:
 * // [ [ 1, 0, 1, 0, 0, 1 ],
 * // [ 1, 2, 3, 4, 6, 9 ],
 * // [ 1, 4, 5, 16, 20, 25 ] ]
 *
 */
export class PolynomialFeatures {
  private degree;

  /**
   *
   * @param degree - The degree of the polynomial features. Default = 2.
   */
  constructor(
    {
      degree = 2
    }: {
      degree: number;
    } = {
      degree: 2
    }
  ) {
    // Constructor variables validation
    if (!_.isNumber(degree)) {
      throw new Error('Degree must be a number');
    }
    this.degree = degree;
  }

  /**
   * Transforms the input data
   * @param X - a matrix
   */
  public transform(
    {
      X = null
    }: {
      X: number[][];
    } = {
      X: null
    }
  ): number[][] {
    if (!math.contrib.isMatrixOf(X, 'number')) {
      throw new Error('Input must be a numeric matrix');
    }
    const matrix = math.matrix(X);
    const [nSamples, nFeatures] = matrix.size();
    const indexCombination = this.indexCombination(nFeatures, this.degree);
    const nOutputFeatures = indexCombination.length;

    // Polynomial feature extraction loop begins
    let result: any = math.ones(nSamples, nOutputFeatures);
    const rowRange = _.range(0, X.length);
    for (let i = 0; i < indexCombination.length; i++) {
      const c = indexCombination[i];
      // Retrieves column values from X using the index of the indexCombination in the loop
      const srcColValues: any =
        c !== null ? math.subset(X, math.index(rowRange, c)) : [];

      // Subsets the placeholder values at [rowRange:i] using the prod value of srcColValues
      let xc = null;
      if (srcColValues.length === 0) {
        xc = _.fill(rowRange.slice(), 1);
      } else {
        xc = math.contrib.prod(srcColValues, 1);
      }
      result = math.subset(result, math.index(rowRange, i), xc);
    }
    return result._data;
  }

  /**
   * Creates a combination of index according to nFeautres and degree
   * @param nFeatures
   * @param degree
   */
  private indexCombination(nFeatures, degree): number[][] {
    const range = _.range(0, degree + 1);
    const combs = range.map(i => {
      return combinationsWithReplacement(_.range(nFeatures), i);
    });
    return combs.reduce((sum, cur) => {
      return sum.concat(cur);
    }, []);
  }
}

/**
 * Data normalization is a process of scaling dataset based on Vector Space Model, and by default, it uses L2 normalization.
 * At a higher level, the chief difference between the L1 and the L2 terms is that the L2 term is proportional
 * to the square of the  β values, while the L1 norm is proportional the absolute value of the values in  β .
 *
 * @example
 * import { normalize } from 'kalimdor/preprocess';
 *
 * const result = normalize({
 *   X: [
 *     [1, -1, 2],
 *     [2, 0, 0],
 *     [0, 1, -1],
 *   ],
 * });
 * console.log(result);
 * // [ [ 0.4082482904638631, -0.4082482904638631, 0.8164965809277261 ],
 * // [ 1, 0, 0 ],
 * // [ 0, 0.7071067811865475, -0.7071067811865475 ] ]
 *
 * @param X - The data to normalize
 * @param norm - The norm to use to normalize each non zero sample; can be either 'l1' or 'l2'
 * @return number[][]
 */
export function normalize(
  {
    X = null,
    norm = 'l2'
  }: {
    X: number[][];
    norm?: string;
  } = {
    X: null,
    norm: 'l2'
  }
): number[][] {
  // Validation
  if (!math.contrib.isMatrixOf(X, 'number')) {
    throw new Error('The data input must be a matrix of numbers');
  }

  const normalizedMatrix = [];
  for (let i = 0; i < X.length; i++) {
    const row = X[i];

    // Adding a placeholder array
    normalizedMatrix.push([]);

    // Getting the row's square root
    let proportion: any = 0; // note: any because math.pow return MathType

    // Normalization proportion value
    if (norm === 'l1') {
      proportion = row.reduce((accum: any, r) => accum + Math.abs(r), 0);
    } else if (norm === 'l2') {
      proportion = row.reduce((accum: any, r) => accum + math.pow(r, 2), 0);
      proportion = Math.sqrt(proportion);
    } else {
      throw new Error(`${norm} is not a recognised normalization method`);
    }

    // Finally applying a cubic root to the total value
    for (let k = 0; k < row.length; k++) {
      const value = row[k] / proportion;
      normalizedMatrix[i].push(value);
    }
  }
  return normalizedMatrix;
}
