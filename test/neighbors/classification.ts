import * as _ from 'lodash';
import { KNeighborsClassifier } from '../../src/lib/neighbors/classification';

describe('classification:KNeighborsClassifier', () => {
  const X1 = [[0, 0, 0], [0, 1, 1], [1, 1, 0], [2, 2, 2], [1, 2, 2], [2, 1, 2]];
  const y1 = [0, 0, 0, 1, 1, 1];

  const X2 = [['a', 'b', 'c'], ['b', 'c', 'd']];
  const y2 = ['a', 'z'];
  it('should predict 1 for [1, 2] against the sample 1', () => {
    const knn = new KNeighborsClassifier();
    knn.fit({ X: X1, y: y1 });
    const expected = 1;
    const pred = knn.predictOne([1, 2]);
    expect(pred).toBe(expected);
  });

  it('should predict 0 for [0, 0, 0] against the sample 1', () => {
    const knn = new KNeighborsClassifier();
    knn.fit({ X: X1, y: y1 });
    const pred = knn.predictOne([0, 0, 0]);
    const expected = 0;
    expect(pred).toBe(expected);
  });

  it('should predictOne throw an error if multi dimensional list is passed in', () => {
    const knn = new KNeighborsClassifier();
    knn.fit({ X: X1, y: y1 });
    const expected = 'Passed in dataset is not a single dimensional array';
    expect(() => {
      knn.predictOne([[1, 1], [1, 1]]);
    }).toThrow(expected);
  });

  it('should predict [ 1, 0, 1 ] for [ [1, 2], [0, 2], [9, 5] ]  against the sample 1', () => {
    const knn = new KNeighborsClassifier();
    knn.fit({ X: X1, y: y1 });
    const pred = knn.predict([[1, 2], [0, 2], [9, 5]]);
    const expected = [1, 0, 1];
    expect(_.isEqual(pred, expected)).toBe(true);
  });

  it('should predict [ 1, 0, 1 ] for [ [1, 2, 4], [0], [9, 5] ] against the sample 1', () => {
    const knn = new KNeighborsClassifier();
    knn.fit({ X: X1, y: y1 });
    const pred = knn.predict([[1, 2, 4], [0], [9, 5]]);
    const expected = [1, 0, 1];
    expect(_.isEqual(pred, expected)).toBe(true);
  });

  it("should predict [ 'a', 'a', 'a' ] for [ [1, 2, 4], [0], [9, 5] ] against the sample 2", () => {
    const knn = new KNeighborsClassifier();
    knn.fit({ X: X2, y: y2 });
    const pred = knn.predict([[1, 2, 4], [0], [9, 5]]);
    const expected = ['a', 'a', 'a'];
    expect(_.isEqual(pred, expected)).toBe(true);
  });

  it('should throw an error if string is the first array element', () => {
    const knn = new KNeighborsClassifier();
    knn.fit({ X: X2, y: y2 });
    expect(() => {
      knn.predict([[1, 'a', 4], [0], [9, 5]]);
    }).toThrow('The dataset to predict must be a matrix or lists of list');
  });
});
