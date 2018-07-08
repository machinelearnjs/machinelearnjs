import { SVC } from '../../src/lib/svm/classes';
describe('svm:classes', () => {

	it('should test svm', () => {
		console.log('inside svctest');
		const svc2 = new SVC();
		const X = [[-1, -1], [-2, -1], [1, 1], [2, 1]];
		const y = [-1, 1, 2, 2];
		svc2.fit({ X: X, y: y }).then((err) => {
			console.log('result ', err);
			try {
				console.log('svc2 pred ', svc2.predict([-0.8, -1]));
			} catch (e) {
				console.log('err', e);
			}
		});

	});
});