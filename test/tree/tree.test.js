"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var tree_1 = require("../../src/lib/tree/tree");
describe('tree:DecisionTreeClassifier', function () {
    var fruitX = [['Green', 3], ['Yellow', 3], ['Red', 1], ['Red', 1], ['Yellow', 3]];
    var fruitY = ['Apple', 'Apple', 'Grape', 'Grape', 'Lemon'];
    var numberX = [[0, 0], [1, 1]];
    var numberY = [0, 1];
    it('Should predict fruitX[0] as Apple', function () {
        var features = ['color', 'diameter', 'label'];
        var decision = new tree_1.DecisionTreeClassifier({ featureLabels: features });
        decision.fit({ X: fruitX, y: fruitY });
        var predictResult = decision.predictOne({ row: fruitX[0] });
        expect(_.isEqual(['Apple'], predictResult)).toBe(true);
    });
    it('Should predict [Purple, 2] as  [Grape, Grape]', function () {
        var features = ['color', 'diameter', 'label'];
        var decision = new tree_1.DecisionTreeClassifier({ featureLabels: features });
        decision.fit({ X: fruitX, y: fruitY });
        var predictResult = decision.predictOne({ row: ['Purple', 2] });
        expect(_.isEqual(['Grape', 'Grape'], predictResult)).toBe(true);
    });
    it('Should predict number [2, 2] as [1]', function () {
        var decision = new tree_1.DecisionTreeClassifier();
        decision.fit({ X: numberX, y: numberY });
        var predictResult = decision.predictOne({ row: [2, 2] });
        expect(_.isEqual([1], predictResult)).toBe(true);
    });
    it('Should predict number [-2, -1] as [0]', function () {
        var decision = new tree_1.DecisionTreeClassifier();
        decision.fit({ X: numberX, y: numberY });
        var predictResult = decision.predictOne({ row: [-2, -1] });
        expect(_.isEqual([0], predictResult)).toBe(true);
    });
    // TODO: Test tree prints
    // Exceptions
    it('Should not fit if invalid data is given', function () {
        var decision = new tree_1.DecisionTreeClassifier();
        var exepctedError = 'Cannot accept non Array values for X and y';
        expect(function () { return decision.fit({ X: null, y: null }); }).toThrow(exepctedError);
        expect(function () { return decision.fit({ X: 1, y: 2 }); }).toThrow(exepctedError);
        expect(function () { return decision.fit({ X: true, y: true }); }).toThrow(exepctedError);
        expect(function () { return decision.fit({ X: [], y: [] }); }).toThrow(exepctedError);
        expect(function () { return decision.fit({ X: -1, y: -2 }); }).toThrow(exepctedError);
    });
    it('Should not predict ');
});
