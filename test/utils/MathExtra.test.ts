import * as tf from '@tensorflow/tfjs';
import * as _ from 'lodash';
import { ValidationError, ValidationInconsistentShape } from '../../src/lib/utils/Errors';
import math from '../../src/lib/utils/MathExtra';
import { inferShape } from '../../src/lib/utils/tensors';

describe('math.size', () => {
  it('should return correct x axis length', () => {
    const testX = [[1, 2, 3], [2, 3, 4]];
    const result = math.size(testX, 0);
    expect(result).toBe(2);
  });

  it('should return correct y axis length', () => {
    const testX = [[1, 2, 3], [2, 3, 4]];
    const result = math.size(testX, 1);
    expect(result).toBe(3);
  });

  it('should throw an error because X is null', () => {
    const testX = null;
    try {
      math.size(testX, 1);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
    }
  });

  it('should throw an error because X is an empty array', () => {
    const testX = [];
    try {
      math.size(testX, 1);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
    }
  });

  it('should throw an error because axis is invalid', () => {
    const testX = [[1, 2], [2, 3]];
    const axis = 12;
    try {
      math.size(testX, axis);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
    }
  });
});

describe('math.range', () => {
  it('should return [0, 1, 2, 3]', () => {
    const result = math.range(0, 4);
    const expected = [0, 1, 2, 3];
    expect(_.isEqual(result, expected)).toBe(true);
  });

  it('should return [-2, -1, 0, 1]', () => {
    const result = math.range(-2, 2);
    const expected = [-2, -1, 0, 1];
    expect(_.isEqual(result, expected)).toBe(true);
  });

  it('should throw an invalid error', () => {
    try {
      math.range('test', 2);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
    }
  });
});

describe('math.isMatrixOf', () => {
  it('should validate [[1, 2, 3], [1, 2, 3]], number true', () => {
    const result = math.isMatrixOf([[1, 2, 3], [1, 2, 3]], 'number');
    expect(result).toBe(true);
  });

  it('should fail to validate [[1, "a", 2], [1, 2, 3]]', () => {
    const result = math.isMatrixOf([[1, 'a', 2], [1, 2, 3]], 'number');
    expect(result).toBe(false);
  });

  it('should fail to valid []', () => {
    try {
      math.isMatrixOf([], 'number');
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
    }
  });
});

describe('math.isMatrix', () => {
  it('should validate true [[1,2], [2, 3]]', () => {
    const result = math.isMatrix([[1, 2], [2, 3]]);
    expect(result).toBe(true);
  });

  it('should validate true [[1, true], ["a", 2]]', () => {
    const result = math.isMatrix([[1, true], ['a', 2]]);
    expect(result).toBe(true);
  });

  it('should validate false []', () => {
    const result = math.isMatrix([]);
    expect(result).toBe(false);
  });

  it('should validate false 123', () => {
    const result = math.isMatrix(123);
    expect(result).toBe(false);
  });
});

describe('math.isArrayOf', () => {
  it('should validate true number of [1, 2, 3]', () => {
    const result = math.isArrayOf([1, 2, 3], 'number');
    expect(result).toBe(true);
  });

  it('should validate true string of ["a", "b"]', () => {
    const result = math.isArrayOf(['a', 'b'], 'string');
    expect(result).toBe(true);
  });

  it('should throw an exception if type is abcd', () => {
    try {
      math.isArrayOf(['a', 'b'], 'abcd');
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
    }
  });
});

describe('math.covariance', () => {
  // Normal arrays
  const X1 = [1, 2, 4, 3, 5];
  const y1 = [1, 3, 3, 2, 5];

  const xMean1 = tf.mean(X1).dataSync();
  const yMean1 = tf.mean(y1).dataSync();

  // Size difference
  const X2 = [1, 4, 7, 8, 9, 10, 10000000];
  const y2 = [1, 2];

  // Arrays with large numbers
  const X3 = [9999999999999, 91284981294, 1912839, 12874991291923919];
  const y3 = [8287288, 819191929129192, 727, 11];
  const xMean3 = tf.mean(X3).dataSync();
  const yMean3 = tf.mean(y3).dataSync();

  it('should calculate covariance against x1 and y1', () => {
    const result = math.covariance(X1, xMean1, y1, yMean1);
    expect(result).toBe(8);
  });

  it('should throw an error when x and y are different in sizes', () => {
    try {
      math.covariance(X2, 1, y2, 2);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
    }
  });

  it('should calculate large numbers', () => {
    const result = math.covariance(X3, xMean3, y3, yMean3);
    expect(result).toMatchSnapshot();
  });
});

describe('math.variance', () => {
  // Normal arrays
  const X1 = [1, 2, 4, 3, 5];
  const xMean1 = tf.mean(X1).dataSync();

  // Size difference
  const X2 = null;

  // Arrays with large numbers
  const X3 = [9999999999999, 91284981294, 1912839, 12874991291923919];
  const xMean3 = tf.mean(X3).dataSync();

  it('should calculate variance against x1', () => {
    const result = math.variance(X1, xMean1);
    expect(result).toBe(10);
  });

  it('should throw an error when x is not an array', () => {
    try {
      math.variance(X2, 1);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
    }
  });

  it('should calculate large numbers', () => {
    const result = math.variance(X3, xMean3);
    const expected = 1.2425916250970963e32;
    expect(expected).toBe(result);
  });
});

describe('math.hstack', () => {
  const X1 = [[1], [2], [3]];
  const y1 = [[2], [3], [4]];

  const X2 = [1, 2, 3];
  const y2 = [2, 3, 4];

  const X3 = [['a'], ['b'], ['c']];
  const y3 = [['b'], ['c'], ['d']];

  it('should hstack a matrix of numbers', () => {
    const result = math.hstack(X1, y1);
    const expectedResult = [[1, 2], [2, 3], [3, 4]];
    expect(result).toEqual(expectedResult);
  });

  it('should hstack a vector of numbers', () => {
    const result = math.hstack(X2, y2);
    const expectedResult = [1, 2, 3, 2, 3, 4];
    expect(result).toEqual(expectedResult);
  });

  it('should hstack a matrix of numbers', () => {
    const result = math.hstack(X3, y3);
    const expectedResult = [['a', 'b'], ['b', 'c'], ['c', 'd']];
    expect(result).toEqual(expectedResult);
  });

  it('should not hstack an invalid input', () => {
    try {
      math.hstack(true, true);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
    }
    try {
      math.hstack(1, 2);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
    }
  });
});

describe('math.inner', () => {
  it('should calculate inner when two pure numbers are given', () => {
    const expected = 4;
    const result = math.inner(2, 2);
    expect(result).toEqual(expected);
  });
  it('should calculate inner when the left arg is a vector and the right arg is a pure number', () => {
    const expected = [6, 6];
    const a = [3, 3];
    const b = 2;
    const result = math.inner(a, b);
    expect(result).toEqual(expected);
  });
  it('should calculate inner when the left arg is a pure number and the right arg is a vector', () => {
    const expected = [6, 6];
    const a = 2;
    const b = [3, 3];
    const result = math.inner(a, b);
    expect(result).toEqual(expected);
  });
  it('should calculate inner when both inputs are vectors', () => {
    const a = [1, 0, 1];
    const b = [2, 2, 3];
    const expected = 5;
    const result = math.inner(a, b);
    expect(result).toEqual(expected);
  });
  it('should throw an error if non number or vector is given for the left input', () => {
    const a = null;
    const b = [2, 2, 2];
    try {
      math.inner(a, b);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
    }
  });
  it('should throw an error if non number or vector is given for the right input', () => {
    const a = [2, 2, 2];
    const b = null;
    try {
      math.inner(a, b);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
    }
  });
  it('should throw an error if two vectors are not same in size', () => {
    const a = [1, 2, 3];
    const b = [1, 2];
    try {
      math.inner(a, b);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationInconsistentShape);
    }
  });
});

describe('math.subset', () => {
  const X1 = [[1, 2], [3, 4]];
  const X2 = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];
  it('should get subset of X1', () => {
    const result = math.subset(X1, [1], [0]);
    expect(result).toEqual([[3]]);
  });

  it('should get subset of X2', () => {
    const result = math.subset(X2, [0, 1, 2], [0]);
    expect(result).toEqual([[1], [1], [1]]);
  });

  it('should subset of X2 with a replacement', () => {
    const result = math.subset(X2, [0, 1, 2], [0], [7, 7, 7]);
    expect(result).toEqual([
      [7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ]);
  });
});

describe('math.generateRandomSubset', () => {
  describe('when max samples is integer and bootstrap is false and maxSamplesIsFloat is false', () => {
    describe('when max samples is in [0, setLength-1] range', () => {
      const set = [1, 2, 3, 4, 5, 6, 7];
      const subset = math.generateRandomSubset(set.length, 4, false, false);

      it('should generate subset of size 4', () => {
        expect(subset.length).toEqual(4);
      });

      it('should have unique elements', () => {
        const s = new Set<number>();
        subset.forEach((x) => {
          expect(s.has(x)).toBeFalsy();
          s.add(x);
        });
      });

      it('should have elements in [0, setLength-1] range', () => {
        expect(subset.every((x) => x >= 0 && x < set.length)).toBeTruthy();
      });
    });

    describe('when max samples is bigger than setLength - 1', () => {
      it('fails with ValidationError', () => {
        try {
          const set = [1, 2, 3, 4, 5, 6, 7];
          math.generateRandomSubset(set.length, set.length + 1, false, false);
        } catch (err) {
          expect(err).toBeInstanceOf(ValidationError);
          expect(err.message).toEqual('maxSamples must be in [0, n_samples]');
        }
      });
    });

    describe('when max samples is negative', () => {
      it('fails with ValidationError', () => {
        try {
          const set = [1, 2, 3, 4, 5, 6, 7];
          math.generateRandomSubset(set.length, -1, false);
        } catch (err) {
          expect(err).toBeInstanceOf(ValidationError);
          expect(err.message).toEqual("maxSamples can't be negative");
        }
      });
    });
  });

  describe('when max samples is integer and bootstrap is true and maxSamplesIsFloat is false', () => {
    const set = [1, 2, 3, 4, 5];
    const subset = math.generateRandomSubset(set.length, 4, true, false);

    it('should generate subset of size 4', () => {
      expect(subset.length).toEqual(4);
    });

    it('should have elements in [0, setLength-1] range', () => {
      expect(subset.every((x) => x >= 0 && x < set.length)).toBeTruthy();
    });
  });

  describe('when max samples is float and bootstrap is false and maxSamplesIsFloat is true', () => {
    describe('when max samples is in [0, 1]', () => {
      const set = [1, 2, 3, 4, 5];
      const subset = math.generateRandomSubset(set.length, 0.5, false, true);

      it('should generate a subset of size set_size*max_samples', () => {
        expect(subset.length).toEqual(Math.floor(set.length * 0.5));
      });

      it('should have unique elements', () => {
        const s = new Set<number>();
        subset.forEach((x) => {
          expect(s.has(x)).toBeFalsy();
          s.add(x);
        });
      });

      it('should have elements in [0, setLength-1] range', () => {
        expect(subset.every((x) => x >= 0 && x < set.length)).toBeTruthy();
      });
    });

    describe('when max samples is < 0', () => {
      it('should fail with ValidationError', () => {
        try {
          const set = [1, 2, 3, 4, 5];
          math.generateRandomSubset(set.length, -1.2, false, true);
        } catch (err) {
          expect(err).toBeInstanceOf(ValidationError);
          expect(err.message).toEqual("maxSamples can't be negative");
        }
      });
    });

    describe('when max samples is > 1', () => {
      it('should fail with ValidationError', () => {
        try {
          const set = [1, 2, 3, 4, 5];
          math.generateRandomSubset(set.length, 1.2, false, true);
        } catch (err) {
          expect(err).toBeInstanceOf(ValidationError);
          expect(err.message).toEqual('maxSamplesIsFloat is true but number bigger than 1 was passed');
        }
      });
    });
  });

  describe('when max samples is integer and bootstrap is true', () => {
    const set = [1, 2, 3, 4, 5];
    const subset = math.generateRandomSubset(set.length, 0.3, true);

    it('should generate subset of size floor(setSize*0.3)', () => {
      expect(subset.length).toEqual(Math.floor(set.length * 0.3));
    });

    it('should have elements in [0, setLength-1] range', () => {
      expect(subset.every((x) => x >= 0 && x < set.length)).toBeTruthy();
    });
  });
});

describe('math.generateRandomSubsetOfMatrix', () => {
  describe('When maxSamples is equal to 4, maxFeatures is equal to 2', () => {
    const X = [[1, 2, 3, 4, 5], [4, 4, 3, 2, 1], [1, 1, 1, 1, 2], [4, 4, 3, 5, 15], [5, 100, 2, 3, 5]];
    const [numRows, numColumns] = inferShape(X);
    const [xSubset, rowIndices, columnIndices] = math.generateRandomSubsetOfMatrix(X, 4, 2, true, true, false, false);

    it('Should have 4 rows', () => {
      expect(xSubset.length).toEqual(4);
    });

    it('Should have 2 columns', () => {
      expect(xSubset.every((row) => row.length === 2)).toBeTruthy();
    });

    it('Should have elements from the corresponding row', () => {
      expect(xSubset.every((row, idx) => row.every((elem) => X[idx].includes(elem))));
    });

    it('Should have rowIndices in [0, numRows] range', () => {
      expect(rowIndices.every((ind) => ind >= 0 && ind < numRows)).toBeTruthy();
    });

    it('Should have columnIndices in [0, numColumns] range', () => {
      expect(columnIndices.every((ind) => ind >= 0 && ind < numColumns)).toBeTruthy();
    });
  });
});
