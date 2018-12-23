import * as _ from 'lodash';
import math from '../../src/lib/utils/MathExtra';

describe('math.contrib.size', () => {
  it('should return correct x axis length', () => {
    const testX = [[1, 2, 3], [2, 3, 4]];
    const result = math.contrib.size(testX, 0);
    expect(result).toBe(2);
  });

  it('should return correct y axis length', () => {
    const testX = [[1, 2, 3], [2, 3, 4]];
    const result = math.contrib.size(testX, 1);
    expect(result).toBe(3);
  });

  it('should throw an error because X is null', () => {
    const testX = null;
    expect(() => {
      math.contrib.size(testX, 1);
    }).toThrow('Invalid input array of size 0!');
  });

  it('should throw an error because X is an empty array', () => {
    const testX = [];
    expect(() => {
      math.contrib.size(testX, 1);
    }).toThrow('Invalid input array of size 0!');
  });

  it('should throw an error because axis is invalid', () => {
    const testX = [[1, 2], [2, 3]];
    const axis = 12;
    expect(() => {
      math.contrib.size(testX, axis);
    }).toThrow(`Invalid axis value ${axis} was given`);
  });
});

describe('math.contrib.range', () => {
  it('should return [0, 1, 2, 3]', () => {
    const result = math.contrib.range(0, 4);
    const expected = [0, 1, 2, 3];
    expect(_.isEqual(result, expected)).toBe(true);
  });

  it('should return [-2, -1, 0, 1]', () => {
    const result = math.contrib.range(-2, 2);
    const expected = [-2, -1, 0, 1];
    expect(_.isEqual(result, expected)).toBe(true);
  });

  it('should throw an invalid error', () => {
    expect(() => math.contrib.range('test', 2)).toThrow(
      'start and stop arguments need to be numbers'
    );
  });
});

describe('math.contrib.isMatrixOf', () => {
  it('should validate [[1, 2, 3], [1, 2, 3]], number true', () => {
    const result = math.contrib.isMatrixOf([[1, 2, 3], [1, 2, 3]], 'number');
    expect(result).toBe(true);
  });

  it('should fail to validate [[1, "a", 2], [1, 2, 3]]', () => {
    const result = math.contrib.isMatrixOf([[1, 'a', 2], [1, 2, 3]], 'number');
    expect(result).toBe(false);
  });

  it('should fail to valid []', () => {
    expect(() => {
      math.contrib.isMatrixOf([], 'number');
    }).toThrow('Cannot perform isMatrixOf number unless the data is matrix');
  });
});

describe('math.contrib.isMatrix', () => {
  it('should validate true [[1,2], [2, 3]]', () => {
    const result = math.contrib.isMatrix([[1, 2], [2, 3]]);
    expect(result).toBe(true);
  });

  it('should validate true [[1, true], ["a", 2]]', () => {
    const result = math.contrib.isMatrix([[1, true], ['a', 2]]);
    expect(result).toBe(true);
  });

  it('should validate false []', () => {
    const result = math.contrib.isMatrix([]);
    expect(result).toBe(false);
  });

  it('should validate false 123', () => {
    const result = math.contrib.isMatrix(123);
    expect(result).toBe(false);
  });
});

describe('math.contrib.isArrayOf', () => {
  it('should validate true number of [1, 2, 3]', () => {
    const result = math.contrib.isArrayOf([1, 2, 3], 'number');
    expect(result).toBe(true);
  });

  it('should validate true string of ["a", "b"]', () => {
    const result = math.contrib.isArrayOf(['a', 'b'], 'string');
    expect(result).toBe(true);
  });

  it('should throw an exception if type is abcd', () => {
    expect(() => {
      math.contrib.isArrayOf(['a', 'b'], 'abcd');
    }).toThrow('Failed to check the array content of type abcd');
  });
});

describe('math.contrib.covariance', () => {
  // Normal arrays
  const X1 = [1, 2, 4, 3, 5];
  const y1 = [1, 3, 3, 2, 5];
  const xMean1 = math.mean(X1);
  const yMean1 = math.mean(y1);

  // Size difference
  const X2 = [1, 4, 7, 8, 9, 10, 10000000];
  const y2 = [1, 2];

  // Arrays with large numbers
  const X3 = [9999999999999, 91284981294, 1912839, 12874991291923919];
  const y3 = [8287288, 819191929129192, 727, 11];
  const xMean3 = math.mean(X3);
  const yMean3 = math.mean(y3);

  it('should calculate covariance against x1 and y1', () => {
    const result = math.contrib.covariance(X1, xMean1, y1, yMean1);
    expect(result).toBe(8);
  });

  it('should throw an error when x and y are different in sizes', () => {
    expect(() => {
      math.contrib.covariance(X2, 1, y2, 2);
    }).toThrow('X and y should match in size');
  });

  it('should calculate large numbers', () => {
    const result = math.contrib.covariance(X3, xMean3, y3, yMean3);
    const expected = -2.6387641603777603e30;
    expect(expected).toBe(result);
  });
});

describe('math.contrib.variance', () => {
  // Normal arrays
  const X1 = [1, 2, 4, 3, 5];
  const xMean1 = math.mean(X1);

  // Size difference
  const X2 = null;

  // Arrays with large numbers
  const X3 = [9999999999999, 91284981294, 1912839, 12874991291923919];
  const xMean3 = math.mean(X3);

  it('should calculate variance against x1', () => {
    const result = math.contrib.variance(X1, xMean1);
    expect(result).toBe(10);
  });

  it('should throw an error when x is not an array', () => {
    expect(() => {
      math.contrib.variance(X2, 1);
    }).toThrow('X must be an array');
  });

  it('should calculate large numbers', () => {
    const result = math.contrib.variance(X3, xMean3);
    const expected = 1.2425916250970963e32;
    expect(expected).toBe(result);
  });
});

describe('math.contrib.hstack', () => {
  const X1 = [[1], [2], [3]];
  const y1 = [[2], [3], [4]];

  const X2 = [1, 2, 3];
  const y2 = [2, 3, 4];

  const X3 = [['a'], ['b'], ['c']];
  const y3 = [['b'], ['c'], ['d']];

  it('should hstack a matrix of numbers', () => {
    const result = math.contrib.hstack(X1, y1);
    const expectedResult = [[1, 2], [2, 3], [3, 4]];
    expect(result).toEqual(expectedResult);
  });

  it('should hstack a vector of numbers', () => {
    const result = math.contrib.hstack(X2, y2);
    const expectedResult = [1, 2, 3, 2, 3, 4];
    expect(result).toEqual(expectedResult);
  });

  it('should hstack a matrix of numbers', () => {
    const result = math.contrib.hstack(X3, y3);
    const expectedResult = [['a', 'b'], ['b', 'c'], ['c', 'd']];
    expect(result).toEqual(expectedResult);
  });

  it('should not hstack an invalid input', () => {
    const expectedError = 'Input should be either matrix or Arrays';
    expect(() => math.contrib.hstack(true, true)).toThrow(expectedError);
    expect(() => math.contrib.hstack(1, 2)).toThrow(expectedError);
  });
});

describe('math.contrib.inner', () => {
  it('should calculate inner when two pure numbers are given', () => {
    const expected = 4;
    const result = math.contrib.inner(2, 2);
    expect(result).toEqual(expected);
  });
  it('should calculate inner when the left arg is a vector and the right arg is a pure number', () => {
    const expected = [6, 6];
    const a = [3, 3];
    const b = 2;
    const result = math.contrib.inner(a, b);
    expect(result).toEqual(expected);
  });
  it('should calculate inner when the left arg is a pure number and the right arg is a vector', () => {
    const expected = [6, 6];
    const a = 2;
    const b = [3, 3];
    const result = math.contrib.inner(a, b);
    expect(result).toEqual(expected);
  });
  it('should calculate inner when both inputs are vectors', () => {
    const a = [1, 0, 1];
    const b = [2, 2, 3];
    const expected = 5;
    const result = math.contrib.inner(a, b);
    expect(result).toEqual(expected);
  });
  it('should throw an error if non number or vector is given for the left input', () => {
    const a = null;
    const b = [2, 2, 2];
    const error = `Cannot process with the invalid inputs ${a} and ${b}`;
    expect(() => math.contrib.inner(a, b)).toThrow(error);
  });
  it('should throw an error if non number or vector is given for the right input', () => {
    const a = [2, 2, 2];
    const b = null;
    const error = `Cannot process with the invalid inputs ${a} and ${b}`;
    expect(() => math.contrib.inner(a, b)).toThrow(error);
  });
  it('should throw an error if two vectors are not same in size', () => {
    const a = [1, 2, 3];
    const b = [1, 2];
    const error = `Dimensions (${a.length},) and (${
      b.length
    },) are not aligned`;
    expect(() => math.contrib.inner(a, b)).toThrow(error);
  });
});

describe('math.contrib.subset', () => {
  const X1 = [[1, 2], [3, 4]];
  const X2 = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ];
  it('should get subset of X1', () => {
    const result = math.contrib.subset(X1, [1], [0]);
    expect(result).toEqual([[3]]);
  });

  it('should get subset of X2', () => {
    const result = math.contrib.subset(X2, [0, 1, 2], [0]);
    expect(result).toEqual([[1], [1], [1]]);
  });

  it('should subset of X2 with a replacement', () => {
    const result = math.contrib.subset(X2, [0, 1, 2], [0], [7, 7, 7]);
    expect(result).toEqual([
      [7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]);
  });
});
