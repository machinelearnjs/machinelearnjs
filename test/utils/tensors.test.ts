import { inferShape, reshape } from '../../src/lib/utils/tensors';

describe('inferShape', () => {
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
    expect(() => inferShape([[2, 3], [1, 2], [4]])).toThrow(
      'Element arr[2] should have 2 elements, but has 1 elements',
    );
  });

  it('should infer a shape of a 3D matrix', () => {
    const shape = inferShape([[[1, 2], [3, 4]], [[5, 6], [7, 8]]]);
    const expected = [2, 2, 2];
    expect(shape).toEqual(expected);
  });

  it('should throw an error if a 3D matrix is incorrectly shaped', () => {
    expect(() => inferShape([[[1, 2], [3, 4]], [[5, 6], [7]]])).toThrow(
      'Element arr[1][1] should have 2 elements, but has 1 elements',
    );
  });

  it('should infer a shape of a 4D matrix', () => {
    const shape = inferShape([[[[1, 2], [1, 2]], [[1, 2], [1, 2]]], [[[1, 2], [1, 2]], [[1, 2], [1, 2]]]]);
    const expected = [2, 2, 2, 2];
    expect(shape).toEqual(expected);
  });
  it('should throw an error if a 4D matrix is incorrectly shaped', () => {
    expect(() => inferShape([[[[1, 2], [1, 2]], [[1, 2], [1, 2]]], [[[1, 2], [1, 2]], [[1, 2], [1]]]])).toThrow(
      'Element arr[1][1][1] should have 2 elements, but has 1 elements',
    );
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
    expect(() =>
      inferShape([
        [[[[1, 2], [1, 2]], [[1, 2], [1, 2]]], [[[1, 2], [1, 2]], [[1, 2], [1, 2]]]],
        [[[[1, 2], [1, 2]], [[1, 2], [1, 2]]], [[[1, 2], [1, 2]], [[1, 2], [1]]]],
      ]),
    ).toThrow('Element arr[1][1][1][1] should have 2 elements, but has 1 elements');
  });
});

describe('reshape', () => {
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
    expect(() => reshape(null, [1])).toThrow('The input array must be an array!');
    expect(() => reshape([], [1])).toThrow('Target array shape [0] cannot be reshaped into 1');
    expect(() => reshape([[1, 2, 3]], null)).toThrow('The sizes must be an array!');
    expect(() => reshape([[1, 2, 3]], 1)).toThrow('The sizes must be an array!');
  });
});
