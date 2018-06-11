"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:no-expression-statement
var _ = require("lodash");
var data_1 = require("../../src/lib/preprocessing/data");
describe('data:OneHotEncoder', function () {
    // Datasets for OneHotEncoding
    var planetList = [
        { planet: 'mars', isGasGiant: false, value: 10 },
        { planet: 'saturn', isGasGiant: true, value: 20 },
        { planet: 'jupiter', isGasGiant: true, value: 30 }
    ];
    it('should encode planet list correctly', function () {
        var enc = new data_1.OneHotEncoder();
        var expectedEncode = [[-1, 0, 1, 0, 0], [0, 1, 0, 1, 0], [1, 1, 0, 0, 1]];
        var encodeInfo = enc.encode(planetList, {
            dataKeys: ['value', 'isGasGiant'],
            labelKeys: ['planet']
        });
        expect(_.isEqual(encodeInfo.data, expectedEncode)).toBe(true);
    });
    it('should decode planet list correctly', function () {
        var enc = new data_1.OneHotEncoder();
        var encodeInfo = enc.encode(planetList, {
            dataKeys: ['value', 'isGasGiant'],
            labelKeys: ['planet']
        });
        var decodedInfo = enc.decode(encodeInfo.data, encodeInfo.decoders);
        expect(_.isEqual(planetList, decodedInfo)).toBe(true);
    });
    it("Invalid data key 'values' should throw an Error", function () {
        var enc = new data_1.OneHotEncoder();
        expect(function () {
            enc.encode(planetList, {
                dataKeys: ['values'],
                labelKeys: ['planet']
            });
        }).toThrow('Cannot find values from data');
    });
    it("Invalid label key 'planot' should throw an Error", function () {
        var enc = new data_1.OneHotEncoder();
        expect(function () {
            enc.encode(planetList, {
                dataKeys: ['value'],
                labelKeys: ['planot']
            });
        }).toThrow('Cannot find planot from labels');
    });
});
describe('data:MinMaxScaler', function () {
    it('should feature range [0, 1] of [4, 5, 6] return [0, 0.5, 1]', function () {
        var expectedResult = [0, 0.5, 1];
        var minmaxScaler = new data_1.MinMaxScaler({ featureRange: [0, 1] });
        minmaxScaler.fit([4, 5, 6]);
        var result = minmaxScaler.fit_transform([4, 5, 6]);
        expect(_.isEqual(expectedResult, result)).toBe(true);
    });
    it('should feature range [0, 100] of [4, 5, 6] return [0, 50, 100]', function () {
        var expectedResult = [0, 50, 100];
        var minmaxScaler = new data_1.MinMaxScaler({ featureRange: [0, 100] });
        minmaxScaler.fit([4, 5, 6]);
        var result = minmaxScaler.fit_transform([4, 5, 6]);
        expect(_.isEqual(expectedResult, result)).toBe(true);
    });
    it('should feature range [-100, 100] of [4, 5, 6] return [ -100, 0, 100 ]', function () {
        var expectedResult = [-100, 0, 100];
        var minmaxScaler = new data_1.MinMaxScaler({ featureRange: [-100, 100] });
        minmaxScaler.fit([4, 5, 6]);
        var result = minmaxScaler.fit_transform([4, 5, 6]);
        expect(_.isEqual(expectedResult, result)).toBe(true);
    });
});
describe('data:Binarizer', function () {
    it('Should [[1, -1, 2], [2, 0, 0], [0, 1, -1]] return [[ 1, 0, 1 ], [ 1, 0, 0 ], [ 0, 1, 0 ]]', function () {
        var binX = [[1, -1, 2], [2, 0, 0], [0, 1, -1]];
        var expected = [[1, 0, 1], [1, 0, 0], [0, 1, 0]];
        var newBin = new data_1.Binarizer({ threshold: 0 });
        var binResult = newBin.transform(binX);
        expect(_.isEqual(binResult, expected)).toBe(true);
    });
    // TODO: Write exception test
});
