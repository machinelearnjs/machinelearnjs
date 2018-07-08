import * as _ from 'lodash';
import { SVC } from '../../src/lib/svm/classes';

jest.mock('libsvm-js', () => () =>
	({
		train: (X, y) => {
			console.info('SVM train', X, y);
		},
		predict: X => X,
	})
);

describe('svm:classes', () => {

	it('should test SVC', () => {
		const svc = new SVC();
		const X = [[-1, -1], [-2, -1], [1, 1], [2, 1]];
		const y = [-1, 1, 2, 2];
		return svc.fit({ X: X, y: y }).then(() => {
			const feed = [-0.8, -1];
			const result = svc.predict(feed);
			expect(_.isEqual(result, feed)).toBe(true);
		});
	});
});