import { isEqual } from 'lodash';
import { LinearRegression } from '../../src/lib/linear_model';

describe('linear_model:LinearRegression', () => {
  const X1 = [1, 2, 4, 3, 5];
  const y1 = [1, 3, 3, 2, 5];
  it('should train on X1 and y1, predict a few results', () => {
    const lr = new LinearRegression();
    lr.fit(X1, y1);

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

  it('should reload and predict the same result', () => {
    const expected1 = [1.1999999999999995, 1.9999999999999996];
    const lr = new LinearRegression();
    lr.fit(X1, y1);

    // Experimenting before saving the checkpoint
    const result1 = lr.predict([1, 2]);
    expect(isEqual(result1, expected1)).toBe(true);

    // Experimenting after saving the checkpoint
    const checkpoint = lr.toJSON();
    const lr2 = new LinearRegression();
    lr2.fromJSON(checkpoint);
    const result2 = lr2.predict([1, 2]);
    expect(isEqual(result2, expected1)).toBe(true);
  });

  it('should test NaNs', () => {
    const lr = new LinearRegression();
    lr.fit(X1, y1);

    const result1 = lr.predict([NaN, NaN]);
    const expected1 = [NaN, NaN];
    expect(isEqual(result1, expected1)).toBe(true);

    const result2 = lr.predict([NaN, 123]);
    const expected2 = [NaN, 98.80000000000001];
    expect(isEqual(result2, expected2)).toBe(true);
  });

  it('should throw an exception when invalid data is given to the fit function', () => {
    const lr = new LinearRegression();
    expect(() => lr.fit('abc', y1)).toThrow(
      'values passed to tensor(values) must be an array of numbers or booleans, or a TypedArray'
    );
    expect(() => lr.fit([], 'abc')).toThrow(
      'The matrix is not 1D shaped: [] of [0]'
    );
    expect(() => lr.fit([1, 2, 3], [1, 2])).toThrow(
      'Sample(3) and target(2) sizes do not match'
    );
  });

  it('should throw an exception when invalid data is given to the predict function', () => {
    const lr = new LinearRegression();
    const err =
      'values passed to tensor(values) must be an array of numbers or booleans, or a TypedArray';
    expect(() => lr.predict([])).toThrow(
      'The matrix is not 1D shaped: [] of [0]'
    );
    expect(() => lr.predict('test')).toThrow(err);
    expect(() => lr.predict(null)).toThrow(err);
  });
});
