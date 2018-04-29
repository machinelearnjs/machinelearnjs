"use strict";
exports.__esModule = true;
var data_1 = require("./data");
var enc = new data_1.OneHotEncoder();
var planetList = [
    { planet: 'mars', isGasGiant: false, value: 10 },
    { planet: 'saturn', isGasGiant: true, value: 20 },
    { planet: 'jupiter', isGasGiant: true, value: 30 }
];
var encodeInfo = enc.encode(planetList, { dataKeys: ['value', 'isGasGiant'], labelKeys: ['planet'] });
console.log('checking data');
console.log(encodeInfo.data);
