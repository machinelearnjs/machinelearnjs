import { GaussianNB } from '../../src/lib/naive_bayes';
import { matchExceptionWithSnapshot } from '../util_testing';

describe('naive_bayes:GaussianNB', () => {
  const X1 = [[1, 20], [2, 21], [3, 22], [4, 22]];
  const y1 = [1, 0, 1, 0];
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
  });
  it('Should fit X1 and y1 and reload then predict the same', () => {
    const expected = [1];

    // Initial model
    const nb = new GaussianNB();
    nb.fit(X1, y1);
    const result = nb.predict([[1, 20]]);
    expect(result).toEqual(expected);

    // Restored model
    const checkpoint = nb.toJSON();
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
    matchExceptionWithSnapshot(nb.predict, [1]);
    matchExceptionWithSnapshot(nb.predict, [null]);
    matchExceptionWithSnapshot(nb.predict, [[1, 2, 3]]);
  });
  it('should not prediction attributes are greater than summary length', () => {
    const nb = new GaussianNB();
    nb.fit(X1, y1);
    const tooManyPredAttrs =
      'Prediction input X length must be equal or less than summary length';
    expect(() => nb.predict([[1, 20, 11, 2]])).toThrow(tooManyPredAttrs);
  });
});
