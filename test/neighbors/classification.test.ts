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
    const pred = knn.predict([1, 2]);
    expect(pred).toBe(expected);
  });

  it('should predict 0 for [0, 0, 0] against the sample 1', () => {
    const knn = new KNeighborsClassifier();
    knn.fit({ X: X1, y: y1 });
    const pred = knn.predict([0, 0, 0]);
    const expected = 0;
    expect(pred).toBe(expected);
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

  it('should reload the nearest neighbor and predict the same result', () => {
    const knn = new KNeighborsClassifier();
    knn.fit({ X: X1, y: y1 });

    // Before saving
    const pred = knn.predict([[1, 2, 4], [0], [9, 5]]);
    const expected = [1, 0, 1];
    expect(_.isEqual(pred, expected)).toBe(true);

    // After reloading
    const checkpoint = knn.toJSON();
    const knn2 = new KNeighborsClassifier();
    knn2.fromJSON(checkpoint);
    const pred2 = knn2.predict([[1, 2, 4], [0], [9, 5]]);
    const expected2 = [1, 0, 1];
    expect(_.isEqual(pred2, expected2)).toBe(true);
  });

  it("should predict [ 'a', 'a', 'a' ] for [ [1, 2, 4], [0], [9, 5] ] against the sample 2", () => {
    const knn = new KNeighborsClassifier();
    knn.fit({ X: X2, y: y2 });
    const pred = knn.predict([[1, 2, 4], [0], [9, 5]]);
    const expected = ['a', 'a', 'a'];
    expect(_.isEqual(pred, expected)).toBe(true);
  });

  it('should throw an error if string is the first array element', () => {
    const expected = 'The dataset is neither an array or a matrix';
    const knn = new KNeighborsClassifier();
    knn.fit({ X: X2, y: y2 });
    expect(() => {
      knn.predict([[1, 'a', 4], [0], [9, 5]]);
    }).toThrow(expected);
  });

  it('should throw an error if X is not a matrix', () => {
    const expected = 'X must be a matrix array!';
    const knn = new KNeighborsClassifier();
    expect(() => {
      // tslint:disable-next-line
      knn.fit({ X: [1], y: [2] });
    }).toThrow(expected);
  });

  it('should throw an error if y is not a vector', () => {
    const expected = 'y must be a vector array!';
    const knn = new KNeighborsClassifier();
    expect(() => {
      // tslint:disable-next-line
      knn.fit({ X: [[1], [2]], y: 123 });
    }).toThrow(expected);
  });
});
