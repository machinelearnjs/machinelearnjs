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
var testX = [[1, 2], [null, 3], [7, 6]];
var imp = new Imputer_1.Imputer({ missingValues: null, axis: 0 });
imp.fit(testX);
var impResult = imp.fit_transform([[null, 2], [6, null], [7, 6]]);
console.log('checking result', impResult);
// Binarizer
var data_2 = require("./data");
var binX = [[1., -1., 2.], [2., 0., 0.], [0., 1., -1.]];
var newBin = new data_2.Binarizer({ threshold: 0 });
var binResult = newBin.transform(binX);
console.log('binresult: ', binResult);
// Label Encoder
var label_1 = require("./label");
var le = new label_1.LabelEncoder();
var labelX = ['amsterdam', 'paris', 'tokyo'];
le.fit(labelX);
var transformX = ["tokyo", "tokyo", "paris"];
var leResult = le.transform(transformX);
console.log(leResult);
