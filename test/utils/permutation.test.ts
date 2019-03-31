import { combinationsWithReplacement } from '../../src/lib/utils/permutations';

describe('utils.permutation.combinationsWithReplacement', () => {
  const expected1 = [[1, 1], [1, 2], [1, 3], [2, 2], [2, 3], [3, 3]];
  const expected2 = [
    [1, 1, 1],
    [1, 1, 2],
    [1, 1, 3],
    [1, 2, 1],
    [1, 2, 2],
    [1, 2, 3],
    [1, 3, 1],
    [1, 3, 2],
    [1, 3, 3],
    [2, 2, 1],
    [2, 2, 2],
    [2, 2, 3],
    [2, 3, 1],
    [2, 3, 2],
    [2, 3, 3],
    [3, 3, 1],
    [3, 3, 2],
    [3, 3, 3],
  ];
  const expected3 = [
    ['t', 't'],
    ['t', 'e'],
    ['t', 's'],
    ['t', 't'],
    ['e', 'e'],
    ['e', 's'],
    ['e', 't'],
    ['s', 's'],
    ['s', 't'],
    ['t', 't'],
  ];
  it('should permutate [1, 2, 3] with 2 repeats', () => {
    const result = combinationsWithReplacement([1, 2, 3], 2);
    expect(result).toEqual(expected1);
  });
  it('should permutate [1, 2, 3] with 3 repeats', () => {
    const result = combinationsWithReplacement([1, 2, 3], 3);
    expect(result).toEqual(expected2);
  });
  it('should permutate [1, 2, 3] and it has to fallback to 3', () => {
    const result = combinationsWithReplacement([1, 2, 3]);
    expect(result).toEqual(expected2);
  });
  it('should permutate a string test with 2 repeats', () => {
    const result = combinationsWithReplacement('test', 2);
    expect(result).toEqual(expected3);
  });
});
