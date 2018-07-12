import math from '../utils/MathExtra';

export class PCA {
	public fit({ X }) {
		math.contrib.subtract(X, [1]);
		const A = X;
		const AT = math.transpose(A);
		const M = math.mean(AT, 1);
		console.log('A', AT, ' M', M);
		const C = math.subtract(A, M);
		console.log(C);
	}
}

const pca = new PCA();
pca.fit({ X: [[1, 2], [3, 4], [5, 6]] });
