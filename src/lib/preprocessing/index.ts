import { OneHotEncoder } from './data';

const enc = new OneHotEncoder();
const planetList = [
	{ planet: 'mars', isGasGiant: false, value: 10 },
	{ planet: 'saturn', isGasGiant: true, value: 20 },
	{ planet: 'jupiter', isGasGiant: true, value: 30 }
]
const encodeInfo = enc.encode(planetList, { dataKeys: ['value', 'isGasGiant'], labelKeys: ['planet'] });
console.log('checking data');
console.log(encodeInfo.data);
