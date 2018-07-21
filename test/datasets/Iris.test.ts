import { isEqual } from 'lodash';
import { Iris } from '../../src/lib/datasets';
import * as irisSnapshot from './snapshots/iris.snapshot';

describe('datasets:Iris', () => {
	it('should data match the snapshot', () => {
		const iris = new Iris();
		expect(isEqual(iris.data, irisSnapshot.data)).toBe(true);
	});
	it('should targetNames match the snapshot', () => {
		const iris = new Iris();
		expect(isEqual(iris.targetNames, irisSnapshot.targetNames)).toBe(true);
	});
	it('should targets match the snapshot', () => {
		const iris = new Iris();
		expect(isEqual(iris.targets, irisSnapshot.targets)).toBe(true);
	});
	it('should description match the description', () => {
		const iris = new Iris();
		expect(isEqual(iris.description, irisSnapshot.description)).toBe(true);
	});
});
