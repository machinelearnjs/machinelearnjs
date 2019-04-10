import { PCA } from '../../src/lib/decomposition';
import { Validation2DMatrixError, ValidationMatrixTypeError } from '../../src/lib/utils/Errors';

describe('decomposition:pca', () => {
  const sample1 = [[1, 2], [3, 4], [5, 6]];
  const sample2 = [[0, 0], [0, 0]];
  const sample3 = [['test'], ['hey']];
  it('should fit sample1 and return correct results', () => {
    const pca = new PCA();
    const expectedComponents = [[0.7071067811865476, 0.7071067811865474], [0.7071067811865474, -0.7071067811865476]];
    const expectedExplainedVariance = [[-0.3535533905932736, 0], [0, 0.5], [0.35355339059327373, 0]];

    pca.fit(sample1);
    expect(expectedComponents).toEqual(pca.components);
    expect(expectedExplainedVariance).toEqual(pca.explained_variance);
  });

  it('should fit sample2 and return correct results', () => {
    const pca = new PCA();
    pca.fit(sample2);
    const expectedComponents = [[1, 0], [0, 1]];
    const expectedExplainedVariance = [[1, 0], [0, 1]];
    expect(expectedComponents).toEqual(pca.components);
    expect(expectedExplainedVariance).toEqual(pca.explained_variance);
  });

  it('should throw an error when the given matrix is empty', () => {
    const pca = new PCA();

    try {
      pca.fit([]);
    } catch (err) {
      expect(err).toBeInstanceOf(Validation2DMatrixError);
    }
  });

  it('should throw an error when the given matrix is not all numbers', () => {
    const pca = new PCA();

    try {
      pca.fit(sample3 as any);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationMatrixTypeError);
    }
  });
});
