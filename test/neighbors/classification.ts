import { KNeighborsClassifier } from "../../src/lib/neighbors/classification";

describe('classification:KNeighborsClassifier', () => {
	const X1 = [[0, 0, 0], [0, 1, 1], [1, 1, 0], [2, 2, 2], [1, 2, 2], [2, 1, 2]];
	const y1 = [0, 0, 0, 1, 1, 1];
	it('Should predict -1 for the sample X1 and y1', () => {
		const knn = new KNeighborsClassifier();
		knn.fit({ X: X1, y: y1 });
		const expected = -1
		const pred = knn.predictOne([1, 2]);
		expect(pred).toBe(expected);
	});

	it('Sho', () => {
		const knn = new KNeighborsClassifier();
		knn.fit({ X: X1, y: y1 });
		const pred = knn.predictOne([1, 2]);
	})
});