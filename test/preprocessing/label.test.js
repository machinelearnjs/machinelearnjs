"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var label_1 = require("../../src/lib/preprocessing/label");
describe('Label', function () {
    it('string labels test', function () {
        var le = new label_1.LabelEncoder();
        var labelX = ['amsterdam', 'paris', 'tokyo'];
        le.fit(labelX);
        var transformX = ['tokyo', 'tokyo', 'paris'];
        var result = le.transform(transformX);
        var expected = [2, 2, 1];
        expect(_.isEqual(result, expected)).toBe(true);
    });
    it('number labels test', function () {
        var le = new label_1.LabelEncoder();
        var labelX = [1, 2, 3, 4];
        le.fit(labelX);
        var transformX = [2, 2, 2, 3];
        var result = le.transform(transformX);
        var expected = [1, 1, 1, 2];
        expect(_.isEqual(result, expected)).toBe(true);
    });
    it('boolean labels test', function () {
        var le = new label_1.LabelEncoder();
        var labelX = [true, false];
        le.fit(labelX);
        var transformX = [true, true, true, false];
        var result = le.transform(transformX);
        var expected = [0, 0, 0, 1];
        expect(_.isEqual(result, expected)).toBe(true);
    });
});
