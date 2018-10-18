import { GaussianNB } from '../../src/lib/naive_bayes';

describe('naive_bayes:GaussianNB', () => {
  const X1 = [[1, 20], [2, 21], [3, 22], [4, 22]];
  const y1 = [1, 0, 1, 0];
  it('Should fit X1 and y1', () => {
    const nb = new GaussianNB();
    nb.fit({ X: X1, y: y1 });
  });
  it('Should fit X1 and y1 then predict', () => {
    const expected = [1];
    const nb = new GaussianNB();
    nb.fit({ X: X1, y: y1 });
    const result = nb.predict({ X: [[1, 20]] });
    expect(result).toEqual(expected);
  });
  it('Should fit string and predict', () => {
    const nb = new GaussianNB();
    nb.fit({ X: X1, y: y1.map(String) });
    const result = nb.predict({ X: [[1, 20]] });
    expect(result).toEqual([1]);
  });
  it('Should fit X1 and y1 and reload then predict the same', () => {
    const expected = [1];

    // Initial model
    const nb = new GaussianNB();
    nb.fit({ X: X1, y: y1 });
    const result = nb.predict({ X: [[1, 20]] });
    expect(result).toEqual(expected);

    // Restored model
    const checkpoint = nb.toJSON();
    const nb2 = new GaussianNB();
    nb2.fromJSON(checkpoint);
    const result2 = nb2.predict({ X: [[1, 20]] });
    expect(result2).toEqual(expected);
  });
  it('Should not fit non array for training data', () => {
    const nb = new GaussianNB();
    const invalidMatrixMsg = 'X must be a matrix';
    expect(() => nb.fit({ X: 123, y: y1 })).toThrow(invalidMatrixMsg);
    expect(() => nb.fit({ X: [1, 2, 3], y: [1, 2] })).toThrow(invalidMatrixMsg);
    expect(() => nb.fit({ X: null, y: [1, 2] })).toThrow(invalidMatrixMsg);
  });
  it('Should not fit non array for testing data', () => {
    const nb = new GaussianNB();
    const invalidMatrixMsg = 'y must be a vector';
    const sizeNotEqual = 'X and y must be same in length';
    expect(() => nb.fit({ X: X1, y: 123 })).toThrow(invalidMatrixMsg);
    expect(() => nb.fit({ X: X1, y: null })).toThrow(invalidMatrixMsg);
    expect(() => nb.fit({ X: X1, y: [] })).toThrow(sizeNotEqual);
  });
  it('Should fit only accept X and y if number of attributes is same', () => {
    const nb = new GaussianNB();
    const sizeNotEqual = 'X and y must be same in length';
    expect(() => nb.fit({ X: X1, y: [1, 2, 3] })).toThrow(sizeNotEqual);
    expect(() => nb.fit({ X: [[1, 20], [2, 21], [3, 22]], y: y1 })).toThrow(sizeNotEqual);
  });
  it('should predict only accept X as matrix', () => {
    const nb = new GaussianNB();
    nb.fit({ X: X1, y: y1 });
    const invalidMatrixMsg = 'X must be a matrix';
    expect(() => nb.predict({ X: 1 })).toThrow(invalidMatrixMsg);
    expect(() => nb.predict({ X: null })).toThrow(invalidMatrixMsg);
    expect(() => nb.predict({ X: [1, 2, 3] })).toThrow(invalidMatrixMsg);
  });
  it('should not prediction attributes are greater than summary length', () => {
    const nb = new GaussianNB();
    nb.fit({ X: X1, y: y1 });
    const tooManyPredAttrs = 'Prediction input X length must be equal or less than summary length';
    expect(() => nb.predict({ X: [[1, 20, 11, 2]] })).toThrow(tooManyPredAttrs);
  });
});
