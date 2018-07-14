import * as _ from 'lodash';
import * as numeric from 'numeric';
import { EVD } from 'ml-matrix';
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

	private U;
	private S;
	private V;

	/**
	 * Fit the model with X.
	 * At the moment it does not take n_components into consideration
	 * so it will only calculate Singular value decomposition
	 * @param {any} X
	 */
	public fit({ X }) {
		if (!X || _.isEmpty(X)) {
			throw Error('Cannot compute PCA with an empty value!');
		}
		if (!math.contrib.isMatrixOf(X)) {
			throw Error('X must be a matrix of numbers');
		}
		const nSamples = X.length;
		// Renaming X to A for readability
		const A = X;
		const AT = math.transpose(A);
		const M = math.mean(AT, 1);
		const C = math.contrib.subtract(X, M);
		const { U, S, V } = numeric.svd(C);
		this.components = V;
		this.explained_variance = numeric.div(numeric.pow(U), nSamples - 1);

		// Internal values for the future usage
		this.U = U;
		this.S = S;
		this.V = V;
	}

}
