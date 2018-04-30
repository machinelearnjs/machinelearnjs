import {
	OneHotEncoder,
	MinMaxScaler
} from './data';

// Playing around with onehotencoder
console.log('Playing with one hot encoder')
const enc = new OneHotEncoder();
const planetList = [
	{ planet: 'mars', isGasGiant: false, value: 10 },
	{ planet: 'saturn', isGasGiant: true, value: 20 },
	{ planet: 'jupiter', isGasGiant: true, value: 30 }
]
const encodeInfo = enc.encode(planetList, { dataKeys: ['value', 'isGasGiant'], labelKeys: ['planet'] });
console.log(encodeInfo.data);

const decodedInfo = enc.decode(encodeInfo.data, encodeInfo.decoders);
console.log(decodedInfo);

// MinMaxScaler
const minmaxScaler = new MinMaxScaler({ featureRange: [0, 1] });
minmaxScaler.fit([4, 5, 6])
const result = minmaxScaler.fit_transform([4, 5, 6]);
console.log(result);
