// tslint:disable:no-expression-statement
import * as _ from 'lodash';
import {
  add_dummy_feature,
  Binarizer,
  MinMaxScaler,
  normalize,
  OneHotEncoder,
  PolynomialFeatures
} from '../../src/lib/preprocessing/data';

describe('data:add_dummy_feature', () => {
  const X1 = [[0, 1], [1, 0]];
  const X2 = [[0, 1, 2], [1, 0, 3]];

  it('should return correct result for X1 with default value', () => {
    const expectedResult = [[1, 0, 1], [1, 1, 0]];
    const result = add_dummy_feature({ X: X1 });
    expect(result).toEqual(expectedResult);
  });

  it('should return correct result for X2 with default value', () => {
    const expectedResult = [[1, 0, 1, 2], [1, 1, 0, 3]];
    const result = add_dummy_feature({ X: X2 });
    expect(result).toEqual(expectedResult);
  });

  it('should return correct result for X1 with value 2', () => {
    const expectedResult = [[2, 0, 1], [2, 1, 0]];
    const result = add_dummy_feature({ X: X1, value: 2 });
    expect(result).toEqual(expectedResult);
  });

  it('should throw error when invalid data is given', () => {
    const expectedError = 'Input must be a matrix';
    expect(() => add_dummy_feature({ X: true })).toThrow(expectedError);
    expect(() => add_dummy_feature({ X: 1 })).toThrow(expectedError);
    expect(() => add_dummy_feature({ X: null })).toThrow(expectedError);
    expect(() => add_dummy_feature({ X: undefined })).toThrow(expectedError);
  });
});

describe('data:OneHotEncoder', () => {
  // Datasets for OneHotEncoding
  const planetList = [
    { planet: 'mars', isGasGiant: false, value: 10 },
    { planet: 'saturn', isGasGiant: true, value: 20 },
    { planet: 'jupiter', isGasGiant: true, value: 30 }
  ];

  it('should encode planet list correctly', () => {
    const enc = new OneHotEncoder();

    const expectedEncode = [[-1, 0, 1, 0, 0], [0, 1, 0, 1, 0], [1, 1, 0, 0, 1]];
    const encodeInfo = enc.encode(planetList, {
      dataKeys: ['value', 'isGasGiant'],
      labelKeys: ['planet']
    });
    expect(_.isEqual(encodeInfo.data, expectedEncode)).toBe(true);
  });

  it('should decode planet list correctly', () => {
    const enc = new OneHotEncoder();

    const encodeInfo = enc.encode(planetList, {
      dataKeys: ['value', 'isGasGiant'],
      labelKeys: ['planet']
    });
    const decodedInfo = enc.decode(encodeInfo.data, encodeInfo.decoders);
    expect(_.isEqual(planetList, decodedInfo)).toBe(true);
  });

  it("Invalid data key 'values' should throw an Error", () => {
    const enc = new OneHotEncoder();
    expect(() => {
      enc.encode(planetList, {
        dataKeys: ['values'],
        labelKeys: ['planet']
      });
    }).toThrow('Cannot find values from data');
  });

  it("Invalid label key 'planot' should throw an Error", () => {
    const enc = new OneHotEncoder();
    expect(() => {
      enc.encode(planetList, {
        dataKeys: ['value'],
        labelKeys: ['planot']
      });
    }).toThrow('Cannot find planot from labels');
  });
});

describe('data:MinMaxScaler', () => {
  it('should feature range [0, 1] of [4, 5, 6] return [0, 0.5, 1]', () => {
    const expectedResult = [0, 0.5, 1];
    const minmaxScaler = new MinMaxScaler({ featureRange: [0, 1] });
    minmaxScaler.fit([4, 5, 6]);
    const result = minmaxScaler.fit_transform([4, 5, 6]);
    expect(_.isEqual(expectedResult, result)).toBe(true);
  });

  it('should feature range [0, 100] of [4, 5, 6] return [0, 50, 100]', () => {
    const expectedResult = [0, 50, 100];
    const minmaxScaler = new MinMaxScaler({ featureRange: [0, 100] });
    minmaxScaler.fit([4, 5, 6]);
    const result = minmaxScaler.fit_transform([4, 5, 6]);
    expect(_.isEqual(expectedResult, result)).toBe(true);
  });

  it('should feature range [-100, 100] of [4, 5, 6] return [ -100, 0, 100 ]', () => {
    const expectedResult = [-100, 0, 100];
    const minmaxScaler = new MinMaxScaler({ featureRange: [-100, 100] });
    minmaxScaler.fit([4, 5, 6]);
    const result = minmaxScaler.fit_transform([4, 5, 6]);
    expect(_.isEqual(expectedResult, result)).toBe(true);
  });
  it('matrix dataset test1', () => {
    const matrix1 = [
      [7, 0.27, 0.36, 20.7, 0.045, 45, 170, 1.001, 3, 0.45, 8.8],
      [6.3, 0.3, 0.34, 1.6, 0.049, 14, 132, 0.994, 3.3, 0.49, 9.5],
      [8.1, 0.28, 0.4, 6.9, 0.05, 30, 97, 0.9951, 3.26, 0.44, 10.1],
      [7.2, 0.23, 0.32, 8.5, 0.058, 47, 186, 0.9956, 3.19, 0.4, 9.9],
      [7.2, 0.23, 0.32, 8.5, 0.058, 47, 186, 0.9956, 3.19, 0.4, 9.9]
    ];
    const expected = [
      0.005135651098384017,
      0.010513296227581941,
      0.015890941356779865
    ];
    const scaler = new MinMaxScaler({ featureRange: [0, 1] });
    scaler.fit(matrix1);
    const result = scaler.fit_transform([1, 2, 3]);
    expect(result).toEqual(expected);
  });
});

describe('data:Binarizer', () => {
  it('Should [[1, -1, 2], [2, 0, 0], [0, 1, -1]] return [[ 1, 0, 1 ], [ 1, 0, 0 ], [ 0, 1, 0 ]]', () => {
    const binX = [[1, -1, 2], [2, 0, 0], [0, 1, -1]];
    const expected = [[1, 0, 1], [1, 0, 0], [0, 1, 0]];
    const newBin = new Binarizer({ threshold: 0 });
    const binResult = newBin.transform(binX);
    expect(_.isEqual(binResult, expected)).toBe(true);
  });
  // TODO: Write exception test
});

describe('data:PolynomialFeatures', () => {
  const X1 = [[0, 1], [2, 3], [4, 5]];

  // Functionalities
  it('should transform X1 with default degree value', () => {
    const poly = new PolynomialFeatures();
    const result = poly.transform({ X: X1 });
    const expected = [
      [1, 0, 1, 0, 0, 1],
      [1, 2, 3, 4, 6, 9],
      [1, 4, 5, 16, 20, 25]
    ];
    expect(result).toEqual(expected);
  });
  it('should transform X1 with degree value 3', () => {
    const poly = new PolynomialFeatures({ degree: 3 });
    const result = poly.transform({ X: X1 });
    const expected = [
      [1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [1, 2, 3, 4, 6, 9, 8, 12, 12, 18, 18, 27],
      [1, 4, 5, 16, 20, 25, 64, 80, 80, 100, 100, 125]
    ];
    expect(result).toEqual(expected);
  });

  // Exceptions
  it('should not transform when invalid values are given', () => {
    const poly = new PolynomialFeatures();
    const expected =
      'Cannot perform isMatrixOf number unless the data is matrix';
    expect(() => poly.transform({ X: null })).toThrow(expected);
    expect(() => poly.transform({ X: [] })).toThrow(expected);
    expect(() => poly.transform({ X: 1 })).toThrow(expected);
    expect(() => poly.transform({ X: 'string' })).toThrow(expected);
  });
  it('should not transform when matrix with non numberic value is given', () => {
    const poly = new PolynomialFeatures();
    const X = [[1, 2, true], [2, 1, 'string'], [null, null, null]];
    expect(() => poly.transform({ X })).toThrow(
      'Input must be a numeric matrix'
    );
  });
  it('should not initiate the class if an invalid degree value is given', () => {
    const expected = 'Degree must be a number';
    expect(() => new PolynomialFeatures({ degree: null })).toThrow(expected);
    expect(() => new PolynomialFeatures({ degree: 'string' })).toThrow(
      expected
    );
    expect(() => new PolynomialFeatures({ degree: [] })).toThrow(expected);
  });
});

describe('data:normalize', () => {
  const X1 = [[1, -1, 2], [2, 0, 0], [0, 1, -1]];
  it('should normalize X1 with l2 norm', () => {
    const expected = [
      [0.4082482904638631, -0.4082482904638631, 0.8164965809277261],
      [1, 0, 0],
      [0, 0.7071067811865475, -0.7071067811865475]
    ];
    const result = normalize({
      X: X1,
      norm: 'l2'
    });
    expect(result).toEqual(expected);
  });
  it('should normalize X1 with l1 norm', () => {
    const expected = [[0.25, -0.25, 0.5], [1, 0, 0], [0, 0.5, -0.5]];
    const result = normalize({
      X: X1,
      norm: 'l1'
    });
    expect(result).toEqual(expected);
  });
  it('should throw an error if unrecognised norm is passed in', () => {
    const expected = 'test is not a recognised normalization method';
    expect(() => normalize({ X: X1, norm: 'test' })).toThrow(expected);
  });
  it('should throw an error if the input is invalid', () => {
    const nullException =
      'Cannot perform isMatrixOf number unless the data is matrix';
    expect(() => normalize({ X: null, norm: 'l1' })).toThrow(nullException);
    expect(() => normalize({ X: [], norm: 'l1' })).toThrow(nullException);
    expect(() => normalize({ X: 'aisjd', norm: 'l1' })).toThrow(nullException);
  });
});
