// tslint:disable:no-expression-statement
import { OneHotEncoder } from './data';

test('OneHotEncoder: buildOneHot', t => {
  const enc = new OneHotEncoder();
  const planetList = [
		{ planet: 'mars', isGasGiant: false, value: 10 },
		{ planet: 'saturn', isGasGiant: true, value: 20 },
		{ planet: 'jupiter', isGasGiant: true, value: 30 }
	]
  enc.encode(planetList, { dataKeys: ['value'] });
});
