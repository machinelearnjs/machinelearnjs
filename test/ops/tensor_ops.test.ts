import { Iris } from '../../src/lib/datasets';
import { inferShape, validateFitInputs } from '../../src/lib/ops/tensor_ops';

describe('ops:validateTrainInputs', () => {
  const X1 = [[1, 2], [3, 4], [5, 6]];
  const y1 = [1, 2, 3];

  const X2 = [[[1, 2], [3, 4], [5, 6]], [[1, 2], [3, 4], [5, 6]]];
  const y2 = [1, 2, 3];
  it('should validate train inputs against X1 and y1', () => {
    validateFitInputs(X1, y1);
  });

  it('should throw an error if the train input X is 3D', () => {
    expect(() => validateFitInputs(X2, y2)).toThrow(
      'The matrix is not 2D shaped: [[[1,2],[3,4],[5,6]],[[1,2],[3,4],[5,6]]] of [2,3,2]'
    );
  });

  it('should throw an error if train input y is 2D', () => {
    expect(() => validateFitInputs(X1, X1)).toThrow(
      'The matrix is not 1D shaped: [[1,2],[3,4],[5,6]] of [3,2]'
    );
  });

  it('should validate Iris dataset', async () => {
    const { data, targets } = await new Iris().load();
    validateFitInputs(data, targets);
  });
});

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
