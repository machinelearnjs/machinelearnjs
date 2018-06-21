import * as _ from 'lodash';
import { KNeighborsClassifier } from "../../src/lib/neighbors/classification";

describe('classification:KNeighborsClassifier', () => {
	const X1 = [[0, 0, 0], [0, 1, 1], [1, 1, 0], [2, 2, 2], [1, 2, 2], [2, 1, 2]];
	const y1 = [0, 0, 0, 1, 1, 1];
	it('should predict 1 for [1, 2] against the sample 1', () => {
		const knn = new KNeighborsClassifier();
		knn.fit({ X: X1, y: y1 });
		const expected = 1
		const pred = knn.predictOne([1, 2]);
		expect(pred).toBe(expected);
	});

	it('should predict 0 for [0, 0, 0] against the sample 1', () => {
		const knn = new KNeighborsClassifier();
		knn.fit({ X: X1, y: y1 });
		const pred = knn.predictOne([0, 0, 0]);
		const expected = 0;
		expect(pred).toBe(expected);
	});

	it('should predictOne throw an error if multi dimensional list is passed in', () => {
		const knn = new KNeighborsClassifier();
		knn.fit({ X: X1, y: y1 });
		const expected = 'Passed in dataset is not a single dimensional array';
		expect(() => {
			knn.predictOne([ [1, 1], [1, 1] ]);
		}).toThrow(expected);
	});

	it('should predict [ [1, 2], [0, 2], [9, 5] ] for [ 1, 0, 1 ] against the sample 1', () => {
		const knn = new KNeighborsClassifier();
		knn.fit({ X: X1, y: y1 });
		const pred = knn.predict([ [1, 2], [0, 2], [9, 5] ]);
		const expected = [ 1, 0, 1 ];
		expect(_.isEqual(pred, expected)).toBe(true);
	})
});