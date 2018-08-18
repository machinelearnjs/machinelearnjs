// tslint:disable:no-expression-statement
import * as _ from 'lodash';
import { add_dummy_feature, Binarizer, MinMaxScaler, OneHotEncoder } from '../../src/lib/preprocessing/data';


describe('data:add_dummy_feature', () => {
  const X1 = [[0, 1], [1, 0]];
  const X2 = [[0, 1, 2], [1, 0, 3]];

  it('should return correct result for X1 with default value', () => {
    const expectedResult = [ [ 1, 0, 1 ], [ 1, 1, 0 ] ];
    const result = add_dummy_feature({ X: X1 });
    expect(result).toEqual(expectedResult);
  });

  it('should return correct result for X2 with default value', () => {
    const expectedResult = [ [ 1, 0, 1, 2 ], [ 1, 1, 0, 3 ] ];
    const result = add_dummy_feature({ X: X2 });
    expect(result).toEqual(expectedResult);
  });

  it('should return correct result for X1 with value 2', () => {
    const expectedResult = [ [2, 0, 1], [2, 1, 0] ];
    const result = add_dummy_feature({ X: X1, value: 2 });
    expect(result).toEqual(expectedResult);
  });

  it('should throw error when invalid data is given', () => {
    const expectedError = 'Input must be a matrix';
    expect(() => add_dummy_feature({ X: true})).toThrow(expectedError);
    expect(() => add_dummy_feature({ X: 1})).toThrow(expectedError);
    expect(() => add_dummy_feature({ X: null})).toThrow(expectedError);
    expect(() => add_dummy_feature({ X: undefined})).toThrow(expectedError);
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
