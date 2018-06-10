"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var Imputer_1 = require("../../src/lib/preprocessing/Imputer");
describe('Imputer', function () {
    it('fit [[1, 2], [null, 3], [7, 6]] and transform [[null, 2], [6, null], [7, 6]]', function () {
        var expectedResult = [[4, 2], [6, 3.6666666666666665], [7, 6]];
        var testX = [[1, 2], [null, 3], [7, 6]];
        var imp = new Imputer_1.Imputer({ missingValues: null, axis: 0 });
        imp.fit(testX);
        var result = imp.fit_transform([[null, 2], [6, null], [7, 6]]);
        expect(_.isEqual(result, expectedResult)).toBe(true);
    });
    it('fit data with dimensions mismatching', function () {
        var textX = [[2, 3], [1, 1, null], [2, 3, 1]];
        var imp = new Imputer_1.Imputer({ missingValues: null, axis: 0 });
        expect(function () {
            imp.fit(textX);
            imp.fit_transform([[null, 2], [1, 2, 3], [null, 2, 1]]);
        }).toThrow('Dimension mismatch (3 != 2)');
    });
    it('fitting invalid data type should throw an error', function () {
        // String
        expect(function () {
            new Imputer_1.Imputer({ missingValues: null, axis: 0 }).fit('asofjasof');
        }).toThrow('X is not an array!');
        // Int
        expect(function () {
            new Imputer_1.Imputer({ missingValues: null, axis: 0 }).fit(123);
        }).toThrow('X is not an array!');
        // Boolean
        expect(function () {
            new Imputer_1.Imputer({ missingValues: null, axis: 0 }).fit(true);
        }).toThrow('X is not an array!');
        // Null
        expect(function () {
            new Imputer_1.Imputer({ missingValues: null, axis: 0 }).fit(null);
        }).toThrow('X is not an array!');
        // undefined
        expect(function () {
            new Imputer_1.Imputer({ missingValues: null, axis: 0 }).fit(undefined);
        }).toThrow('X is not an array!');
    });
});
