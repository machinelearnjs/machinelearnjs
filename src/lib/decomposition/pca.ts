import * as numeric from 'numeric';
import { validateMatrix2D } from '../ops';
import { Type2DMatrix } from '../types';
import math from '../utils/MathExtra';

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
export class PCA {
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
    const nSamples = X.length;
    // Renaming X to A for readability
    const A = X;
    const AT = math.transpose(A);
    const M = math.mean(AT, 1);
    const C = math.contrib.subtract(X, M);
    const svd = numeric.svd(C);
    this.components = svd.V;
    this.explained_variance = numeric.div(numeric.pow(svd.U), nSamples - 1);
  }
}
