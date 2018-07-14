import * as numeric from 'numeric';
import * as cov from 'compute-covariance'
import { EVD } from 'ml-matrix';
import math from '../utils/MathExtra';

export class PCA {
	public fit({ X }) {
		const A = X;
		const AT = math.transpose(A);
		const M = math.mean(AT, 1);
		const C = math.contrib.subtract(X, M);
		const CT = math.transpose(C);
		const CV = cov(CT);
		const stuff = numeric.eig(CV);
		console.log('checking stuff', stuff);
	}
}

const pca = new PCA();
pca.fit({ X: [[1, 2], [3, 4], [5, 6]] });
