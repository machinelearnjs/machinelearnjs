import * as _ from 'lodash';
import { DecisionTreeClassifier } from '../../src/lib/tree/tree';

describe('tree:DecisionTreeClassifier', () => {
	const fruitX = [['Green', 3], ['Yellow', 3], ['Red', 1], ['Red', 1], ['Yellow', 3]];
	const fruitY = ['Apple', 'Apple', 'Grape', 'Grape', 'Lemon'];

	const numberX = [[0, 0], [1, 1]];
	const numberY = [0, 1];

	it('Should predict fruitX[0] as Apple', () => {
		const features = ['color', 'diameter', 'label'];
		const decision = new DecisionTreeClassifier({ featureLabels: features });
		decision.fit({ X: fruitX, y: fruitY });
		const predictResult = decision.predictOne({ row: fruitX[0] });
		expect(_.isEqual(['Apple'], predictResult)).toBe(true)
	});

	it('Should predict [Purple, 2] as  [Grape, Grape]', () => {
		const features = ['color', 'diameter', 'label'];
		const decision = new DecisionTreeClassifier({ featureLabels: features });
		decision.fit({ X: fruitX, y: fruitY });
		const predictResult = decision.predictOne({ row: ['Purple', 2] });
		expect(_.isEqual(['Grape', 'Grape'], predictResult)).toBe(true)
	});

	// TODO: Print tests

	it('Should predict number [2, 2] as', () => {
		const decision = new DecisionTreeClassifier();
		decision.fit({ X: numberX, y: numberY });
		const predictResult = decision.predictOne({ row: [2, 2] });
		console.log('pred result', predictResult);
		expect(_.isEqual(['Grape', 'Grape'], predictResult)).toBe(true)
	});
});