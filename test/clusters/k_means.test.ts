import * as _ from 'lodash';
import { KMeans } from '../../src/lib/cluster';
import { validate2DMatrixErrorMessage } from '../Errors';

// TODO: Improve on kmeans cluster testing
describe('clusters:k_means', () => {
  const vector1 = [[1, 2], [1, 4], [1, 0], [4, 2], [4, 4], [4, 0]];

  const predVector1 = [[0, 0], [4, 4]];
  const predVector2 = [[1298392183, 0], [0, 1]];

  it('should fit vector1 + k=2 should return centroids of size 2 and clusters of size 2', () => {
    const expecterdCluster = {
      centroids: [[2.5, 1], [2.5, 4]],
      clusters: [[[1, 2], [1, 0], [4, 2], [4, 0]], [[1, 4], [4, 4]]],
      k: 2
    };
    const kmean = new KMeans({ k: 2 });
    kmean.fit(vector1);
    expect(expecterdCluster).toEqual(kmean.toJSON());
  });

  it('should fit vector1 + k=3 size 3 and clusters of size 2', () => {
    const expectedCluster = {
      centroids: [[2.5, 2], [2.5, 4], [2.5, 0]],
      clusters: [[[1, 2], [4, 2]], [[1, 4], [4, 4]], [[1, 0], [4, 0]]],
      k: 3
    };
    const kmean = new KMeans({ k: 3 });
    kmean.fit(vector1);
    expect(_.isEqual(expectedCluster, kmean.toJSON())).toBe(true);
  });

  it('should predict [2, 1] from predVector1 prediction', () => {
    const expectedResult = [2, 1];
    const kmean = new KMeans({ k: 3 });
    kmean.fit(vector1);
    const pred = kmean.predict(predVector1);
    expect(_.isEqual(pred, expectedResult)).toBe(true);
  });

  it('should predict [ 0, 0 ] from predVector2 prediction', () => {
    const expectedResult = [0, 0];
    const kmean = new KMeans({ k: 3 });
    kmean.fit(vector1);
    const pred = kmean.predict(predVector2);
    expect(_.isEqual(pred, expectedResult)).toBe(true);
  });

  it('should predict [ 0, 0 ] from predVector2 with X: vector1', () => {
    const expectedResult = [0, 0];
    const kmean = new KMeans({ k: 2 });
    kmean.fit(vector1);
    const pred = kmean.predict(predVector2);
    expect(_.isEqual(expectedResult, pred)).toBe(true);
  });

  it('should predict the same after reloading the model', () => {
    const expectedResult = [0, 0];
    const kmean = new KMeans({ k: 2 });
    kmean.fit(vector1);
    const pred1 = kmean.predict(predVector2);
    expect(_.isEqual(expectedResult, pred1)).toBe(true);

    const checkpoint = kmean.toJSON();

    const kmean2 = new KMeans();
    kmean2.fromJSON(checkpoint);
    const pred2 = kmean.predict(predVector2);
    expect(_.isEqual(expectedResult, pred2)).toBe(true);
  });

  it('should not fit none 2D matrix', () => {
    const kmean = new KMeans({ k: 2 });
    expect(() => kmean.fit([1, 2])).toThrow(
      'The matrix is not 2D shaped: [1,2] of [2]'
    );
    expect(() => kmean.fit(null)).toThrow(validate2DMatrixErrorMessage);
    // TODO: implement datatype check to the validation method
    // expect(() => kmean.fit([["aa", "bb"]])).toThrow('The matrix is not 2D shaped: [1,2] of [2]');
  });
});
