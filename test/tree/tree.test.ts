import * as _ from 'lodash';
import { DecisionTreeClassifier } from '../../src/lib/tree/tree';

describe('tree:DecisionTreeClassifier', () => {
  const fruitX = [
    ['Green', 3],
    ['Yellow', 3],
    ['Red', 1],
    ['Red', 1],
    ['Yellow', 3]
  ];
  const fruitY = ['Apple', 'Apple', 'Grape', 'Grape', 'Lemon'];

  const numberX = [[0, 0], [1, 1]];
  const numberY = [0, 1];

  it('Should predict fruitX[0] as Apple', () => {
    const features = ['color', 'diameter', 'label'];
    const decision = new DecisionTreeClassifier({ featureLabels: features });
    decision.fit({ X: fruitX, y: fruitY });
    const predictResult = decision.predictOne({ row: fruitX[0] });
    expect(_.isEqual(['Apple'], predictResult)).toBe(true);
  });

  it('Should predict [Purple, 2] as  [Grape, Grape]', () => {
    const features = ['color', 'diameter', 'label'];
    const decision = new DecisionTreeClassifier({ featureLabels: features });
    decision.fit({ X: fruitX, y: fruitY });
    const predictResult = decision.predictOne({ row: ['Purple', 2] });
    expect(_.isEqual(['Grape', 'Grape'], predictResult)).toBe(true);
  });

  it('Should predict number [2, 2] as [1]', () => {
    const decision = new DecisionTreeClassifier();
    decision.fit({ X: numberX, y: numberY });
    const predictResult = decision.predictOne({ row: [2, 2] });
    expect(_.isEqual([1], predictResult)).toBe(true);
  });

  it('Should predict number [-2, -1] as [0]', () => {
    const decision = new DecisionTreeClassifier();
    decision.fit({ X: numberX, y: numberY });
    const predictResult = decision.predictOne({ row: [-2, -1] });
    expect(_.isEqual([0], predictResult)).toBe(true);
  });

  it('It should predictOne raw number value', () => {
    const decision = new DecisionTreeClassifier();
    decision.fit({ X: numberX, y: numberY });
    const predictResult = decision.predictOne({ row: 1 });
    expect(_.isEqual(predictResult, [0])).toBe(true);
  });

  // TODO: Test tree prints

  // Exceptions
  it('Should not fit if invalid data is given', () => {
    const decision = new DecisionTreeClassifier();
    const exepctedError = 'Cannot accept non Array values for X and y';
    expect(() => decision.fit({ X: null, y: null })).toThrow(exepctedError);
    expect(() => decision.fit({ X: 1, y: 2 })).toThrow(exepctedError);
    expect(() => decision.fit({ X: true, y: true })).toThrow(exepctedError);
    expect(() => decision.fit({ X: [], y: [] })).toThrow(exepctedError);
    expect(() => decision.fit({ X: -1, y: -2 })).toThrow(exepctedError);
  });

  it('predict should throw an error is array is given', () => {
    const decision = new DecisionTreeClassifier();
    const expectedError = 'X need to be an array!';
    expect(() => {
      decision.fit({ X: numberX, y: numberY });
      decision.predict({ X: 1 });
    }).toThrow(expectedError);
  });
});
