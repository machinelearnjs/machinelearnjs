import { checkArray } from '../../src/lib/utils/validation';

describe('checkArray', () => {
  it('should check that it\'s not an array', () => {
    const arr = null;
    const result = checkArray(arr);
    expect(result.isArray).toBe(false);
    expect(result.multiclass).toBe(false);
  });
  it('should check that it\'s an array', () => {
    const arr = [1, 2, 3];
    const result = checkArray(arr);
    expect(result.isArray).toBe(true);
    expect(result.multiclass).toBe(false);
  });
  it('should check that it\'s a multi-class array', () => {
    const arr = [[1, 2], [1, 2]];
    const result = checkArray(arr);
    expect(result.isArray).toBe(true);
    expect(result.multiclass).toBe(true);
  });
  it('should check that it\'s a multi-class if sub-arrays are empty', () => {
    const arr = [[], []];
    const result = checkArray(arr);
    expect(result.isArray).toBe(true);
    expect(result.multiclass).toBe(true);
  });
});
