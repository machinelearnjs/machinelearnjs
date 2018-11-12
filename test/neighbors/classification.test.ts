import * as _ from 'lodash';
import { KNeighborsClassifier } from '../../src/lib/neighbors';
import { matchExceptionWithSnapshot } from '../util_testing';

describe('classification:KNeighborsClassifier', () => {
  const X1 = [[0, 0, 0], [0, 1, 1], [1, 1, 0], [2, 2, 2], [1, 2, 2], [2, 1, 2]];
  const y1 = [0, 0, 0, 1, 1, 1];

  const X2 = [['a', 'b', 'c'], ['b', 'c', 'd']];
  const y2 = ['a', 'z'];
  it('should predict 1 for [1, 2] against the sample 1', () => {
    const knn = new KNeighborsClassifier();
    knn.fit(X1, y1);
    const expected = 1;
    const pred = knn.predict([1, 2]);
    expect(pred).toBe(expected);
  });

  it('should predict 0 for [0, 0, 0] against the sample 1', () => {
    const knn = new KNeighborsClassifier();
    knn.fit(X1, y1);
    const pred = knn.predict([0, 0, 0]);
    const expected = 0;
    expect(pred).toBe(expected);
  });

  it('should predict [ 1, 0, 1 ] for [ [1, 2], [0, 2], [9, 5] ]  against the sample 1', () => {
    const knn = new KNeighborsClassifier();
    knn.fit(X1, y1);
    const pred = knn.predict([[1, 2], [0, 2], [9, 5]]);
    const expected = [1, 0, 1];
    expect(_.isEqual(pred, expected)).toBe(true);
  });

  it('should fit X2 and predict y2', () => {
    const knn = new KNeighborsClassifier();
    knn.fit(X2, y2);
    const pred = knn.predict([['a', 'b', 'c']]);
    const expected = ['a'];
    expect(pred).toEqual(expected);
  });

  it('should predict [ 1, 0, 1 ] for [ [1, 2, 4], [0], [9, 5] ] against the sample 1', () => {
    const knn = new KNeighborsClassifier();
    expect(() => knn.predict([[1, 2, 4], [0], [9, 5]])).toThrow(
      'Element arr[1] should have 3 elements, but has 1 elements'
    );
  });

  it('should throw an error if X is not a matrix', () => {
    const knn = new KNeighborsClassifier();
    matchExceptionWithSnapshot(knn.fit, [[1], [2]]);
  });

  it('should throw an error if y is not a vector', () => {
    const knn = new KNeighborsClassifier();
    matchExceptionWithSnapshot(knn.fit, [[[1], [2]], 123]);
  });
});
