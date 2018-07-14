import * as _ from 'lodash';
import { PCA } from '../../src/lib/decomposition/pca';

describe('decomposition:pca', () => {
  const sample1 = [[1, 2], [3, 4], [5, 6]];
  const sample2 = [[0, 0], [0, 0]];
  const sample3 = [['test'], ['hey']];
  it('should fit sample1 and return correct results', () => {
    const pca = new PCA();
    const expectedComponents = [[0.7071067811865476, 0.7071067811865474], [0.7071067811865474, -0.7071067811865476]];
    const expectedExplainedVariance = [[-0.3535533905932736, 0], [0, 0.5], [0.35355339059327373, 0]];

    pca.fit({ X: sample1 });

    expect(_.isEqual(expectedComponents, pca.components)).toBe(true);
    expect(_.isEqual(expectedExplainedVariance, pca.explained_variance)).toBe(true);
  });

  it('should fit sample2 and return correct results', () => {
    const pca = new PCA();
    pca.fit({ X: sample2 });
    const expectedComponents = [[1, 0], [0, 1]];
    const expectedExplainedVariance = [[1, 0], [0, 1]];
    expect(_.isEqual(expectedComponents, pca.components)).toBe(true);
    expect(_.isEqual(expectedExplainedVariance, pca.explained_variance)).toBe(true);
  });

  it('should throw an error when the given matrix is empty', () => {
    const pca = new PCA();
    expect(() => pca.fit({ X: [] })).toThrow('Cannot compute PCA with an empty value!');
  });

  it('should throw an error when the given matrix is not all numbers', () => {
    const pca = new PCA();
    expect(() => pca.fit({ X: sample3 })).toThrow('X must be a matrix of numbers');
  });
});
