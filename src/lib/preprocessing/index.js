"use strict";
exports.__esModule = true;
var data_1 = require("./data");
// Playing around with onehotencoder
console.log('Playing with one hot encoder');
var enc = new data_1.OneHotEncoder();
var planetList = [
    { planet: 'mars', isGasGiant: false, value: 10 },
    { planet: 'saturn', isGasGiant: true, value: 20 },
    { planet: 'jupiter', isGasGiant: true, value: 30 }
];
var encodeInfo = enc.encode(planetList, { dataKeys: ['value', 'isGasGiant'], labelKeys: ['planet'] });
console.log(encodeInfo.data);
var decodedInfo = enc.decode(encodeInfo.data, encodeInfo.decoders);
console.log(decodedInfo);
// MinMaxScaler
var minmaxScaler = new data_1.MinMaxScaler({ featureRange: [0, 1] });
minmaxScaler.fit([4, 5, 6]);
var result = minmaxScaler.fit_transform([4, 5, 6]);
console.log(result);
// Imputer
var Imputer_1 = require("./Imputer");
var testX = [[1, 2], [null, 3], [123, 3]];
var imp = new Imputer_1.Imputer({ missingValues: null, axis: 1 });
console.log(imp.fit(testX));
