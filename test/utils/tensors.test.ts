import * as tf from '@tensorflow/tfjs';
import { ValidationError, ValidationInconsistentShape } from '../../src/lib/utils/Errors';
import { covariance, inferShape, reshape, variance } from '../../src/lib/utils/tensors';

describe('tensors.inferShape', () => {
  it('should return 0 for an empty array', () => {
    const shape = inferShape([]);
    const expected = [0];
    expect(shape).toEqual(expected);
  });

  it('should infer a shape of a 1D matrix', () => {
    const shape = inferShape([1, 2]);
    const expected = [2];
    expect(shape).toEqual(expected);
  });
  it('should infer a shape of a 2D matrix', () => {
    const shape = inferShape([[2, 3], [1, 2], [4, 5]]);
    const expected = [3, 2];
    expect(shape).toEqual(expected);
  });
  it('should throw an error if a 2D matrix is incorrectly shaped', () => {
    try {
      inferShape([[2, 3], [1, 2], [4]]);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationInconsistentShape);
    }
  });

  it('should infer a shape of a 3D matrix', () => {
    const shape = inferShape([[[1, 2], [3, 4]], [[5, 6], [7, 8]]]);
    const expected = [2, 2, 2];
    expect(shape).toEqual(expected);
  });

  it('should throw an error if a 3D matrix is incorrectly shaped', () => {
    try {
      inferShape([[[1, 2], [3, 4]], [[5, 6], [7]]]);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationInconsistentShape);
    }
  });

  it('should infer a shape of a 4D matrix', () => {
    const shape = inferShape([[[[1, 2], [1, 2]], [[1, 2], [1, 2]]], [[[1, 2], [1, 2]], [[1, 2], [1, 2]]]]);
    const expected = [2, 2, 2, 2];
    expect(shape).toEqual(expected);
  });
  it('should throw an error if a 4D matrix is incorrectly shaped', () => {
    try {
      inferShape([[[[1, 2], [1, 2]], [[1, 2], [1, 2]]], [[[1, 2], [1, 2]], [[1, 2], [1]]]]);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationInconsistentShape);
    }
  });

  it('should infer a shape of a 5D matrix', () => {
    const shape = inferShape([
      [[[[1, 2], [1, 2]], [[1, 2], [1, 2]]], [[[1, 2], [1, 2]], [[1, 2], [1, 2]]]],
      [[[[1, 2], [1, 2]], [[1, 2], [1, 2]]], [[[1, 2], [1, 2]], [[1, 2], [1, 2]]]],
    ]);
    const expected = [2, 2, 2, 2, 2];
    expect(shape).toEqual(expected);
  });

  it('should throw an error if a 5D matrix is incorrectly shaped', () => {
    try {
      inferShape([
        [[[[1, 2], [1, 2]], [[1, 2], [1, 2]]], [[[1, 2], [1, 2]], [[1, 2], [1, 2]]]],
        [[[[1, 2], [1, 2]], [[1, 2], [1, 2]]], [[[1, 2], [1, 2]], [[1, 2], [1]]]],
      ]);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationInconsistentShape);
    }
  });
});

describe('tensors.reshape', () => {
  it('should reshape an array of shape [1] into [2, 3]', () => {
    const result = reshape([1, 2, 3, 4, 5, 6], [2, 3]);
    expect(result).toEqual([[1, 2, 3], [4, 5, 6]]);
  });

  it('should reshape an array of shape [2, 3] into [1]', () => {
    // console.log(tf.tensor1d([1, 2, 3]).shape);
    const result = reshape([[1, 2, 3], [4, 5, 6]], [6]);
    expect(result).toEqual(result);
  });

  it('should reshape an array of shape [1] into [2, 3, 1]', () => {
    const result = reshape([1, 2, 3, 4, 5, 6], [2, 3, 1]);
    expect(result).toEqual([[[1], [2], [3]], [[4], [5], [6]]]);
  });

  it('should reshape an array of shape [2, 3] into [2, 3, 1]', () => {
    const result = reshape([[1, 2, 3], [4, 5, 6]], [2, 3, 1]);
    expect(result).toEqual([[[1], [2], [3]], [[4], [5], [6]]]);
  });

  it('should not reshape invalid inputs', () => {
    try {
      reshape(null, [1]);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
    }
    try {
      reshape([], [1]);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
    }
    try {
      reshape([[1, 2, 3]], null);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
    }
    try {
      reshape([[1, 2, 3]], 1);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
    }
  });
});

describe('tensors.variance', () => {
  const X1 = tf.tensor1d([1, 2, 3, 4, 5]);
  const xMean = tf.mean(X1).asScalar();

  const X2 = tf.tensor1d([9999999999999, 91284981294, 1912839, 12874991291923919]);
  const xMean2 = tf.mean(X2).asScalar();

  it('should calculate variance against x1', () => {
    const result = variance(X1, xMean).dataSync()[0];
    expect(result).toEqual(2);
  });

  it('should calculate large numbers', () => {
    const result = variance(X2, xMean2).dataSync()[0];
    const expected = 3.1064789974574877e31;
    expect(result).toEqual(expected);
  });
});

describe('tensors.covariance', () => {
  // Normal arrays
  const X1 = tf.tensor1d([1, 2, 4, 3, 5]);
  const y1 = tf.tensor1d([1, 3, 3, 2, 5]);

  const xMean1 = tf.mean(X1).asScalar();
  const yMean1 = tf.mean(y1).asScalar();

  const X3 = tf.tensor1d([9999999999999, 91284981294, 1912839, 12874991291923919]);
  const y3 = tf.tensor1d([8287288, 819191929129192, 727, 11]);
  const xMean3 = tf.mean(X3).asScalar();
  const yMean3 = tf.mean(y3).asScalar();

  it('should calculate covariance against x1 and y1', () => {
    const result = covariance(X1, xMean1, y1, yMean1).dataSync()[0];
    const expected = 1.600000023841858;
    expect(result).toEqual(expected);
  });

  it('should calculate latge numbers', () => {
    const result = covariance(X3, xMean3, y3, yMean3).dataSync()[0];
    const expected = -6.59691023603407e29;
    expect(result).toEqual(expected);
  });
});
