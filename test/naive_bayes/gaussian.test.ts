import { GaussianNB } from '../../src/lib/naive_bayes';
import { matchExceptionWithSnapshot } from '../util_testing';

describe('naive_bayes:GaussianNB', () => {
  const X1 = [
    [1, 20],
    [20, 210],
    [3, 22],
    [40, 220],
    [6, 10],
    [7, 11],
    [7, 11]
  ];
  const y1 = [1, 0, 1, 0, 2, 2, 2];
  it('Should fit X1 and y1', () => {
    const nb = new GaussianNB();
    nb.fit(X1, y1);
  });
  it('Should fit X1 and y1 then predict', () => {
    const expected = [1];
    const nb = new GaussianNB();
    nb.fit(X1, y1);
    const result = nb.predict([[1, 20]]);
    expect(result).toEqual(expected);
    const result2 = nb.predict([[25, 225]]);
    expect(result2).toEqual([0]);
    const result3 = nb.predict([[30, 215]]);
    expect(result3).toEqual([0]);
    const result4 = nb.predict([[3, 22]]);
    expect(result4).toEqual([1]);
    const result5 = nb.predict([[6, 10]]);
    expect(result5).toEqual([2]);
  });
  it('Should fit num and predict', () => {
    const nb = new GaussianNB();
    nb.fit(X1, y1);
    const result = nb.predict([[1, 22]]);
    expect(result).toEqual([1]);
  });
  it('Should fit string and predict', () => {
    const nb = new GaussianNB<string>();
    nb.fit(X1, y1.map(String));
    const result = nb.predict([[25, 225]]);
    expect(result).toEqual(['0']);
  });
  it('Should fit X1 and y1 and reload then predict the same', () => {
    const expected = [1];

    // Initial model
    const nb = new GaussianNB();
    nb.fit(X1, y1);
    const result = nb.predict([[1, 20]]);
    expect(result).toEqual(expected);

    // Restored model
    const checkpoint = JSON.parse(JSON.stringify(nb.toJSON()));
    const nb2 = new GaussianNB();
    nb2.fromJSON(checkpoint);
    const result2 = nb2.predict([[1, 20]]);
    expect(result2).toEqual(expected);
  });
  it('Should not fit non array for training data', () => {
    const nb = new GaussianNB();
    matchExceptionWithSnapshot(nb.fit, [123, y1]);
    matchExceptionWithSnapshot(nb.fit, [[1, 2, 3], [1, 2]]);
    matchExceptionWithSnapshot(nb.fit, [null, [1, 2]]);
  });
  it('Should not fit non array for testing data', () => {
    const nb = new GaussianNB();
    matchExceptionWithSnapshot(nb.fit, [X1, 123]);
    matchExceptionWithSnapshot(nb.fit, [X1, null]);
    matchExceptionWithSnapshot(nb.fit, [X1, []]);
  });
  it('Should fit only accept X and y if number of attributes is same', () => {
    const nb = new GaussianNB();
    matchExceptionWithSnapshot(nb.fit, [X1, [1, 2, 3]]);
    matchExceptionWithSnapshot(nb.fit, [[[1, 20], [2, 21], [3, 22]], y1]);
  });
  it('should predict only accept X as matrix', () => {
    const nb = new GaussianNB();
    nb.fit(X1, y1);
    matchExceptionWithSnapshot(nb.predict, [1]);
    matchExceptionWithSnapshot(nb.predict, [null]);
    matchExceptionWithSnapshot(nb.predict, [[1, 2, 3]]);
  });
  it('should not prediction attributes are greater than summary length', () => {
    const nb = new GaussianNB();
    nb.fit(X1, y1);
    const tooManyPredAttrs =
      'Prediction input 4 length must be equal or less than summary length 2';
    expect(() => nb.predict([[1, 20, 11, 2]])).toThrow(tooManyPredAttrs);
  });
});
