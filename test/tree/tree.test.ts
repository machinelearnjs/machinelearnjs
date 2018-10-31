import fakeFetch from 'jest-fetch-mock';
import { Iris } from '../../src/lib/datasets';
import {
  classCounts,
  DecisionTreeClassifier,
  Leaf
} from '../../src/lib/tree/tree';
import { IRIS_FAKE_DATA, IRIS_FAKE_DESC } from '../datasets/fake_data/iris';

// Mock fetch
global.fetch = fakeFetch;

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

  // Fetch mock for Iris dataset
  beforeEach(() => {
    fetch.resetMocks();
  });

  it('Should predict fruitX[0] as Apple', () => {
    const features = ['color', 'diameter', 'label'];
    const decision = new DecisionTreeClassifier({ featureLabels: features });
    decision.fit(fruitX, fruitY);
    const X = [fruitX[0]];
    const predictResult = decision.predict(X);
    const expectedResult = ['Apple'];
    expect(expectedResult).toEqual(predictResult);
  });

  it('Should predict [Purple, 2] as  [Grape, Grape]', () => {
    const features = ['color', 'diameter', 'label'];
    const decision = new DecisionTreeClassifier({ featureLabels: features });
    decision.fit(fruitX, fruitY);
    const X = [['Purple', 2]];
    const predictResult = decision.predict(X);
    const expectedResult = ['Grape'];
    expect(predictResult).toEqual(expectedResult);
  });

  it('Should predict number [2, 2] as [1]', () => {
    const decision = new DecisionTreeClassifier();
    decision.fit(numberX, numberY);
    const matrix = [[2, 2]];
    const predictResult = decision.predict(matrix);
    const expectedResult = [1];
    expect(predictResult).toEqual(expectedResult);
  });

  it('Should reload and predict the same result', () => {
    const expected = [1];
    const X = [[2, 2]];

    // Before saving
    const decision = new DecisionTreeClassifier();
    decision.fit(numberX, numberY);
    const predictResult = decision.predict(X);
    expect(expected).toEqual(predictResult);

    // After reloading
    const checkpoint = decision.toJSON();
    const decision2 = new DecisionTreeClassifier();
    decision2.fromJSON(checkpoint);
    const predictResult2 = decision2.predict(X);
    expect(expected).toEqual(predictResult2);
  });

  it('Should predict number [-2, -1] as [0]', () => {
    const decision = new DecisionTreeClassifier();
    decision.fit(numberX, numberY);

    const X = [[-2, -1]];
    const predictResult = decision.predict(X);
    const expectedResult = [0];
    expect(predictResult).toEqual(expectedResult);
  });

  // Exceptions
  it('Should not fit if invalid data is given', () => {
    const decision = new DecisionTreeClassifier();
    const exepctedError = 'Cannot accept non Array values for X and y';
    expect(() => decision.fit(null, null)).toThrow(exepctedError);
    expect(() => decision.fit(1, 2)).toThrow(exepctedError);
    expect(() => decision.fit(true, true)).toThrow(exepctedError);
    expect(() => decision.fit([], [])).toThrow(exepctedError);
    expect(() => decision.fit(-1, -2)).toThrow(exepctedError);
  });

  it('predict should throw an error is array is given', () => {
    const decision = new DecisionTreeClassifier();
    const expectedError = 'X needs to be a matrix!';
    expect(() => {
      decision.fit(numberX, numberY);
      decision.predict(1);
    }).toThrow(expectedError);
  });

  it('should return a correct class counts for fruitY', () => {
    const counts = classCounts(fruitY);
    expect(counts).toMatchSnapshot();
  });

  it('should use fruitX and print a correct tree', () => {
    let outputData = '';
    console.info = inputs => (outputData += inputs);
    const features = ['color', 'diameter', 'label'];
    const decision = new DecisionTreeClassifier({ featureLabels: features });
    decision.fit(fruitX, fruitY);
    expect(outputData).toMatchSnapshot();
  });

  it('should create a correct Leaf', () => {
    const leaf = new Leaf(fruitY);
    expect(leaf).toEqual({ prediction: 'Apple' });
  });

  it('should correctly predict Iris data 1', async () => {
    // Iris data mock
    fetch.mockResponseOnce(IRIS_FAKE_DATA);
    // Iris desc mock
    fetch.mockResponseOnce(IRIS_FAKE_DESC);

    const iris = new Iris();
    const { data, targets } = await iris.load();
    const decision = new DecisionTreeClassifier();
    decision.fit(data, targets);

    const example1 = [5.1, 3.5, 1.4, 0.2];
    const result = decision.predict([example1]);
    const expected = [0];
    expect(result).toEqual(expected);
  });

  it('should correctly predict Iris data 2', async () => {
    // Iris data mock
    fetch.mockResponseOnce(IRIS_FAKE_DATA);
    // Iris desc mock
    fetch.mockResponseOnce(IRIS_FAKE_DESC);

    const iris = new Iris();
    const { data, targets } = await iris.load();
    const decision = new DecisionTreeClassifier();
    decision.fit(data, targets);

    const example1 = [5.9, 3, 5.1, 1.8];
    const result = decision.predict([example1]);
    const expected = [2];
    expect(result).toEqual(expected);
  });
});
