import { LinearRegression } from '../../src/lib/linear_model';

describe('linear_model:LinearRegression (Univariate)', () => {
  const X1 = [1, 2, 4, 3, 5];
  const y1 = [1, 3, 3, 2, 5];
  it('should train on X1 and y1, predict a few results', () => {
    const lr = new LinearRegression();
    lr.fit(X1, y1);

    const result1 = lr.predict([1, 2]);
    const expected1 = [1.1999999523162839, 1.999999952316284];
    expect(result1).toEqual(expected1);

    const result2 = lr.predict([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const expected2 = [
      1.1999999523162839,
      1.999999952316284,
      2.799999952316284,
      3.599999952316284,
      4.399999952316284,
      5.1999999523162845,
      5.999999952316284,
      6.799999952316284,
      7.599999952316284,
      8.399999952316284
    ];
    expect(result2).toEqual(expected2);
  });

  it('should reload and predict the same result', () => {
    const expected1 = [1.1999999523162839, 1.999999952316284];
    const lr = new LinearRegression();
    lr.fit(X1, y1);

    // Experimenting before saving the checkpoint
    const result1 = lr.predict([1, 2]);
    expect(result1).toEqual(expected1);

    // Experimenting after saving the checkpoint
    const checkpoint = lr.toJSON();
    const lr2 = new LinearRegression();
    lr2.fromJSON(checkpoint);
    const result2 = lr2.predict([1, 2]);
    expect(result2).toEqual(expected1);
  });

  it('should test NaNs', () => {
    const lr = new LinearRegression();
    lr.fit(X1, y1);

    const result1 = lr.predict([NaN, NaN]);
    const expected1 = [NaN, NaN];
    expect(result1).toEqual(expected1);

    const result2 = lr.predict([NaN, 123]);
    const expected2 = [NaN, 98.79999995231628];
    expect(result2).toEqual(expected2);
  });

  it('should throw an exception when invalid data is given to the fit function', () => {
    const lr = new LinearRegression();
    expect(() => lr.fit('abc', y1)).toThrow(
      'values passed to tensor(values) must be an array of numbers or booleans, or a TypedArray'
    );
    expect(() => lr.fit([], 'abc')).toThrow(
      'values passed to tensor(values) must be an array of numbers or booleans, or a TypedArray'
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

describe('linear_model:LinearRegression (Multivariate)', () => {
  const X1 = [[1, 1], [1, 2], [2, 2], [2, 3]];
  const y1 = [1, 1, 2, 2];
  it('should train X1 and y1, predict a few results', () => {
    const lr = new LinearRegression();
    lr.fit(X1, y1);
    const result1 = lr.predict([[1, 2]]);
    const expected1 = [1.0000001788139343];
    expect(result1).toEqual(expected1);

    const result2 = lr.predict([[1, 2], [3, 4], [5, 6], [7, 8]]);
    const expected = [
      1.0000001788139343,
      3.0000003576278687,
      5.000000536441803,
      7.000000715255737
    ];
    expect(result2).toEqual(expected);
  });

  it('should reload and predict the same result', () => {
    const expected1 = [1.0000001788139343];
    const lr = new LinearRegression();
    lr.fit(X1, y1);

    // Experimenting before saving the checkpoint
    const result1 = lr.predict([[1, 2]]);
    expect(result1).toEqual(expected1);

    // Experimenting after saving the checkpoint
    const checkpoint = lr.toJSON();
    const lr2 = new LinearRegression();
    lr2.fromJSON(checkpoint);
    const result2 = lr2.predict([[1, 2]]);
    expect(result2).toEqual(expected1);
  });

  it('should test NaNs', () => {
    const lr = new LinearRegression();
    lr.fit(X1, y1);

    const result1 = lr.predict([[NaN, NaN]]);
    const expected1 = [NaN];
    expect(result1).toEqual(expected1);

    const result2 = lr.predict([[NaN, 123]]);
    expect(result2).toEqual(expected1);
  });
});
