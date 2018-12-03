import { MultinomialNB } from '../../src/lib/naive_bayes/multinomial';
/*
X = np.array([[6, 9], [5, 5], [9, 5])
import numpy as np
X = np.array([[6, 9], [5, 5], [9, 5], [9, 6]])
y = np.array(['1', '2', '3', '3'])
from sklearn.naive_bayes import MultinomialNB
clf = MultinomialNB()
clf.fit(X, y)

print(clf.predict(np.array([[6,9]])))
print(clf.predict(np.array([[5,5]])))
print(clf.predict(np.array([[9,5]])))
print(clf.predict(np.array([[1,9]])))
print(clf.predict(np.array([[9,9]])))
print(clf.predict(np.array([[90,9]])))
print(clf.predict(np.array([[1,90]])))
>>> clf.class_log_prior_
array([-1.09861229, -1.09861229, -1.09861229])
>>> clf.feature_log_prob_
array([[-0.8873032 , -0.53062825],
       [-0.69314718, -0.69314718],
       [-0.47000363, -0.98082925]])
*/

describe('naive_bayes:MultinomialNB', () => {
  const X1 = [[6, 9], [5, 5], [9, 5]];
  const y1 = ['1', '2', '3'];
  const expectedTests: ReadonlyArray<[[number, number], string]> = [
    [[6, 9], '1'],
    [[5, 5], '2'],
    [[9, 5], '3'],
    [[1, 9], '1'],
    [[9, 9], '2'],
    [[90, 9], '3'],
    [[1, 90], '1']
  ];
  /*
multinomial model
[
      0.40000012516975403,
      0.5999998450279236,
      0.5,
      0.5,
      0.6428568959236145,
      0.3571430742740631 ]
*/
  const X2 = [[6, 9], [5, 5], [9, 5], [9, 6]];
  const y2 = ['1', '2', '3', '3'];
  const expectedTests2: ReadonlyArray<[[number, number], string]> = [
    [[6, 9], '1'],
    [[5, 5], '3'],
    [[9, 5], '3'],
    [[1, 9], '1'],
    [[9, 9], '3'],
    [[90, 9], '3'],
    [[1, 90], '1']
  ];
  it('Should fit X1 and y1', () => {
    const nb = new MultinomialNB<string>();
    nb.fit(X1, y1);

    expectedTests.forEach(expectedTest => {
      const [test, expected] = expectedTest;
      const result = nb.predict([test]);
      expect(result).toEqual([expected]);
    });

    // test input as tests on fited model
    X1.forEach((test, i) => {
      const result = nb.predict([test]);
      expect(result).toEqual([y1[i]]);
    });
  });
  it('Should fit X1 and y1 as number', () => {
    const nb = new MultinomialNB();
    nb.fit(X1, y1.map(y => +y));

    expectedTests.forEach(expectedTest => {
      const [test, expected] = expectedTest;
      const result = nb.predict([test]);
      expect(result).toEqual([+expected]);
    });
    X1.forEach((test, i) => {
      const result = nb.predict([test]);
      expect(result).toEqual([+y1[i]]);
    });
  });
  it('Should fit X1 and y1 with 2to1 class maps', () => {
    const nb = new MultinomialNB<string>();
    nb.fit(X2, y2);

    expectedTests2.forEach(expectedTest => {
      const [test, expected] = expectedTest;
      const result = nb.predict([test]);
      expect(result).toEqual([expected]);
    });
  });

  it('Should refit X1 and then predict the same', () => {
    const expected = ['1'];

    // Initial model
    const nb = new MultinomialNB<string>();
    nb.fit(X1, y1);
    const result = nb.predict([[1, 20]]);
    expect(result).toEqual(expected);

    nb.fit(X1, y1);
    expect(nb.predict([[1, 20]])).toEqual(expected);
  });
  it('Should fit X1 and y1 and reload then predict the same', () => {
    const expected = ['1'];

    // Initial model
    const nb = new MultinomialNB<string>();
    nb.fit(X1, y1);
    const result = nb.predict([[1, 20]]);
    expect(result).toEqual(expected);

    // Restored model
    const checkpoint = JSON.parse(JSON.stringify(nb.toJSON()));
    const nb2 = new MultinomialNB<string>();
    nb2.fromJSON(checkpoint);
    const result2 = nb2.predict([[1, 20]]);
    expect(result2).toEqual(expected);
  });
});
