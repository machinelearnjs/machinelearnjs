import { checkArray } from "../../src/lib/utils/validation";

describe('checkArray', () => {
  it('should check that it\'s not an array', () => {
    const arr = null;
    const result = checkArray(arr);
    console.log('checking result', result);
    expect(result.isArray).toBe(false);
  })
});