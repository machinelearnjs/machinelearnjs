import { isEqual } from 'lodash';
import { LinearRegression } from '../../src/lib/linear_model/linear_regression';

describe('linear_model:LinearRegression', () => {
  const X1 = [1, 2, 4, 3, 5];
  const y1 = [1, 3, 3, 2, 5];
  it('should train on X1 and y1, predict a few results', () => {
    const lr = new LinearRegression();
    lr.fit({ X: X1, y: y1 });

    const result1 = lr.predict([1, 2]);
    const expected1 = [1.1999999999999995, 1.9999999999999996];
    expect(isEqual(result1, expected1)).toBe(true);

    const result2 = lr.predict([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const expected2 = [
      1.1999999999999995,
      1.9999999999999996,
      2.8,
      3.5999999999999996,
      4.3999999999999995,
      5.2,
      6,
      6.8,
      7.6,
      8.399999999999999
    ];
    expect(isEqual(result2, expected2)).toBe(true);
  });

  it('should test NaNs', () => {
    const lr = new LinearRegression();
    lr.fit({ X: X1, y: y1 });

    const result1 = lr.predict([NaN, NaN]);
    const expected1 = [NaN, NaN];
    expect(isEqual(result1, expected1)).toBe(true);

    const result2 = lr.predict([NaN, 123]);
    const expected2 = [NaN, 98.80000000000001];
    expect(isEqual(result2, expected2)).toBe(true);
  });

  it('should throw exceptions when given non arrays to fit', () => {
    const lr = new LinearRegression();
    expect(() => lr.fit({ X: 'abc', y: y1 })).toThrow('X and y must be arrays');
    expect(() => lr.fit({ X: [], y: 'abc' })).toThrow('X and y must be arrays');
    expect(() => lr.fit({ X: [1, 2, 3], y: [1, 2] })).toThrow('X and y must be equal in size');
  });
});
