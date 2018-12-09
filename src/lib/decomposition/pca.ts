import * as tf from '@tensorflow/tfjs';
import * as numeric from 'numeric';
import { reshape, validateMatrix2D, validateMatrixType } from '../ops';
import { IMlModel, Type2DMatrix } from '../types';

/**
 * Principal component analysis (PCA)
 *
 * Linear dimensionality reduction using Singular Value Decomposition of
 * the data to project it to a lower dimensional space.
 *
 * - It uses the LAPACK implementation of the full SVD
 * - or randomized a randomised truncated SVD by the method of
 * Halko et al. 2009, depending on the shape
 * of the input data and the number of components to extract. (Will be implemented)
 *
 * @example
 * import { PCA } from 'kalimdor/decomposition';
 *
 * const pca = new PCA();
 * const X = [[1, 2], [3, 4], [5, 6]];
 * pca.fit(X);
 * console.log(pca.components); // result: [ [ 0.7071067811865476, 0.7071067811865474 ], [ 0.7071067811865474, -0.7071067811865476 ] ]
 * console.log(pca.explained_variance); // result: [ [ -0.3535533905932736, 0 ], [ 0, 0.5 ], [ 0.35355339059327373, 0 ] ]
 */
export class PCA implements IMlModel<number> {
  /**
   * Principal axes in feature space, representing the directions of
   * maximum variance in the data. The components are sorted by explained_variance_.
   */
  public components;

  /**
   * The amount of variance explained by each of the selected components.
   *
   * Equal to n_components largest eigenvalues of the covariance matrix of X.
   */
  public explained_variance;

  /**
   * Fit the model with X.
   * At the moment it does not take n_components into consideration
   * so it will only calculate Singular value decomposition
   * @param {any} X
   */
  public fit(X: Type2DMatrix<number>): void {
    validateMatrix2D(X);
    validateMatrixType(X, ['number']);
    const nSamples = X.length;
    // Renaming X to A for readability
    const A = tf.tensor2d(X);

    // const transposed = tf.transpose(A, [1, 0]);
    const AT = tf.transpose(A, [1, 0]);

    const M = tf.mean(AT, 1);
    const rawC = tf.sub(A, M);
    const C: any = reshape([...rawC.dataSync()], rawC.shape);
    const svd = numeric.svd(C);
    this.components = svd.V;
    this.explained_variance = numeric.div(numeric.pow(svd.U), nSamples - 1);
  }

  /**
   * Predict does nothing in PCA
   * @param X - A 2D matrix
   */
  public predict(X: Type2DMatrix<number> = null): number[][] {
    console.info('Predict does nothing in PCA\n', X);
    return null;
  }

  /**
   * Saves the model's states
   */
  public toJSON(): {
    components: number[][];
    explained_variance: number[][];
  } {
    return {
      components: this.components,
      explained_variance: this.explained_variance
    };
  }

  /**
   * Restores the model from given states
   * @param components - Principal axes in feature space, representing the directions of maximum variance in the data.
   * @param explained_variance - The amount of variance explained by each of the selected components.
   */
  public fromJSON(
    {
      components = null,
      explained_variance = null
    }: {
      components: Type2DMatrix<number>;
      explained_variance: Type2DMatrix<number>;
    } = {
      components: null,
      explained_variance: null
    }
  ): void {
    this.components = components;
    this.explained_variance = explained_variance;
  }
}
