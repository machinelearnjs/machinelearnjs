import * as tf from '@tensorflow/tfjs';
import * as _ from 'lodash';
import {
  inferShape,
  reshape,
  validateMatrix1D,
  validateMatrix2D
} from '../ops';
import { Type1DMatrix, Type2DMatrix } from '../types';
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
 * const dummy = add_dummy_feature([[0, 1, 2], [1, 0, 3]]);
 * console.log(dummy); // returns: [ [ 1, 0, 1, 2 ], [ 1, 1, 0, 3 ] ]
 *
 * @param X - A matrix of data
 * @param value - Value to use for the dummy feature.
 */
export function add_dummy_feature(
  X: Type2DMatrix<number> = null,
  value: number = 1.0
): number[][] {
  if (Array.isArray(X) && X.length === 0) {
    throw new TypeError('X cannot be empty');
  }
  validateMatrix2D(X);
  const tensorX = tf.tensor2d(X) as tf.Tensor;
  const [nSamples] = tensorX.shape;
  const ones = tf.ones([nSamples, 1]) as tf.Tensor;
  const sValue = tf.scalar(value) as tf.Tensor;
  const multipledOnes = tf.mul(ones, sValue);
  const hStacked = tf.concat([multipledOnes, tensorX], 1);
  return reshape(Array.from(hStacked.dataSync()), hStacked.shape) as number[][];
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
  private dataMax: number;
  private dataMin: number;
  private featureMax: number;
  private featureMin: number;
  private dataRange: number;
  private scale: number;
  private baseMin: number;

  /**
   * @param featureRange - scaling range
   */
  constructor(
    {
      featureRange = [0, 1]
    }: {
      featureRange?: number[];
    } = {
      featureRange: [0, 1]
    }
  ) {
    this.featureRange = featureRange;
  }

  /**
   * Compute the minimum and maximum to be used for later scaling.
   * @param {number[]} X - Array or sparse-matrix data input
   */
  public fit(X: Type1DMatrix<number> | Type2DMatrix<number>): void {
    let rowMax = tf.tensor(X);
    let rowMin = tf.tensor(X);
    const xShape = inferShape(X);
    // If input is a Matrix...
    if (xShape.length === 0 || xShape[0] === 0) {
      throw new TypeError('Cannot fit with an empty value');
    } else if (xShape.length === 2) {
      rowMax = tf.max(rowMax as tf.Tensor, 0);
      rowMin = tf.min(rowMin as tf.Tensor, 0);
    }
    this.dataMax = tf.max(rowMax as tf.Tensor).dataSync()[0];
    this.dataMin = tf.min(rowMin as tf.Tensor).dataSync()[0];
    this.featureMax = this.featureRange[1];
    this.featureMin = this.featureRange[0];
    // const zz = zzdataMax - zzdataMin;
    this.dataRange = this.dataMax - this.dataMin;
    // We need different data range for multi-dimensional
    this.scale = (this.featureMax - this.featureMin) / this.dataRange;
    this.baseMin = this.featureMin - this.dataMin * this.scale;
  }

  /**
   * Fit to data, then transform it.
   * @param {number[]} X - Original input vector
   */
  public fit_transform(X: Type1DMatrix<number> = null): number[] {
    validateMatrix1D(X);
    const X1 = X.map(x => x * this.scale);
    return X1.map(x => x + this.baseMin);
  }

  /**
   * Undo the scaling of X according to feature_range.
   * @param {number[]} X - Scaled input vector
   */
  public inverse_transform(X: Type1DMatrix<number> = null): number[] {
    validateMatrix1D(X);
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
  public fit(X: Type2DMatrix<number> = null): void {
    if (Array.isArray(X) && X.length === 0) {
      throw new TypeError('X cannot be empty');
    }
    validateMatrix2D(X);
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
  public transform(X: Type2DMatrix<number> = null): any[] {
    const _X = this.copy ? _.clone(X) : X;
    if (Array.isArray(_X) && _X.length === 0) {
      throw new TypeError('X cannot be empty');
    }
    validateMatrix2D(_X);
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
 * poly.transform(X);
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
    if (!Number.isInteger(degree)) {
      throw new Error('Degree must be a number');
    }
    this.degree = degree;
  }

  /**
   * Transforms the input data
   * @param X - a matrix
   */
  public transform(X: Type2DMatrix<number> = null): number[][] {
    if (Array.isArray(X) && X.length === 0) {
      throw new TypeError('X cannot be empty');
    }
    validateMatrix2D(X);
    const matrix = tf.tensor2d(X);
    const [nSamples, nFeatures] = matrix.shape;
    const indexCombination = this.indexCombination(nFeatures, this.degree);
    const nOutputFeatures = indexCombination.length;

    // Polynomial feature extraction loop begins
    const tfOnes = tf.ones([nSamples, nOutputFeatures]);
    let result = reshape(Array.from(tfOnes.dataSync()), tfOnes.shape);
    const rowRange = _.range(0, X.length);
    for (let i = 0; i < indexCombination.length; i++) {
      const c = indexCombination[i];
      const colsRange = Array.isArray(c) ? c : [c];
      // Retrieves column values from X using the index of the indexCombination in the loop
      const srcColValues: any =
        c !== null ? math.contrib.subset(X, rowRange, colsRange) : [];
      let xc = null;
      if (srcColValues.length === 0) {
        xc = _.fill(rowRange.slice(), 1);
      } else {
        xc = tf
          .tensor2d(srcColValues)
          .prod(1)
          .dataSync();
        // console.log('tfjs', zz);
        // xc = math.contrib.prod(srcColValues, 1);
        // console.log('xc', xc)
      }
      result = math.contrib.subset(result, rowRange, [i], xc);
    }
    return result as number[][];
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
 * import { normalize } from 'kalimdor/preprocessing';
 *
 * const result = normalize([
 *   [1, -1, 2],
 *   [2, 0, 0],
 *   [0, 1, -1],
 * ], { norm: 'l2' });
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
  X: Type2DMatrix<number> = null,
  {
    norm = 'l2'
  }: {
    norm: string;
  } = {
    norm: 'l2'
  }
): number[][] {
  if (Array.isArray(X) && X.length === 0) {
    throw new TypeError('X cannot be empty');
  }
  validateMatrix2D(X);
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
      proportion = row.reduce((accum: any, r) => accum + Math.pow(r, 2), 0);
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
