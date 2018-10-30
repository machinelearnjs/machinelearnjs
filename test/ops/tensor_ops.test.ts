import { inferShape } from '../../src/lib/ops/tensor_ops';

describe('ops:inferShape', () => {
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
      'Element arr[2] should have 2 elements, but has 1 elements'
    );
  });

  it('should infer a shape of a 3D matrix', () => {
    const shape = inferShape([[[1, 2], [3, 4]], [[5, 6], [7, 8]]]);
    const expected = [2, 2, 2];
    expect(shape).toEqual(expected);
  });
  it('should throw an error if a 3D matrix is incorrectly shaped', () => {
    expect(() => inferShape([[[1, 2], [3, 4]], [[5, 6], [7]]])).toThrow(
      'Element arr[1][1] should have 2 elements, but has 1 elements'
    );
  });

  it('should infer a shape of a 4D matrix', () => {
    const shape = inferShape([
      [[[1, 2], [1, 2]], [[1, 2], [1, 2]]],
      [[[1, 2], [1, 2]], [[1, 2], [1, 2]]]
    ]);
    const expected = [2, 2, 2, 2];
    expect(shape).toEqual(expected);
  });
  it('should throw an error if a 4D matrix is incorrectly shaped', () => {
    expect(() =>
      inferShape([
        [[[1, 2], [1, 2]], [[1, 2], [1, 2]]],
        [[[1, 2], [1, 2]], [[1, 2], [1]]]
      ])
    ).toThrow(
      'Element arr[1][1][1] should have 2 elements, but has 1 elements'
    );
  });

  it('should infer a shape of a 5D matrix', () => {
    const shape = inferShape([
      [
        [[[1, 2], [1, 2]], [[1, 2], [1, 2]]],
        [[[1, 2], [1, 2]], [[1, 2], [1, 2]]]
      ],
      [
        [[[1, 2], [1, 2]], [[1, 2], [1, 2]]],
        [[[1, 2], [1, 2]], [[1, 2], [1, 2]]]
      ]
    ]);
    const expected = [2, 2, 2, 2, 2];
    expect(shape).toEqual(expected);
  });

  it('should throw an error if a 5D matrix is incorrectly shaped', () => {
    expect(() =>
      inferShape([
        [
          [[[1, 2], [1, 2]], [[1, 2], [1, 2]]],
          [[[1, 2], [1, 2]], [[1, 2], [1, 2]]]
        ],
        [
          [[[1, 2], [1, 2]], [[1, 2], [1, 2]]],
          [[[1, 2], [1, 2]], [[1, 2], [1]]]
        ]
      ])
    ).toThrow(
      'Element arr[1][1][1][1] should have 2 elements, but has 1 elements'
    );
  });
});
