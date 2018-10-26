import { Iris } from '../../src/lib/datasets/Iris';
import {
  SGDClassifier,
  SGDRegressor
} from '../../src/lib/linear_model/stochastic_gradient';
import { accuracyScore } from '../../src/lib/metrics';
import { train_test_split } from '../../src/lib/model_selection';

const X1 = [[0, 0], [1, 1]];
const y1 = [0, 1];

describe('linear_model:SGDClassifier', () => {
  const expected1 = [1]; // expected with more training
  const accuracyExpected1 = 0.7;
  it('should solve xor with 100000 epochs', () => {
    const clf = new SGDClassifier({ epochs: 100000 });
    clf.fit({ X: X1, y: y1 });
    const result = clf.predict({ X: [[2, 2]] });
    expect(result).toEqual(expected1);
  });
  it('should solve iris with 10000 epochs and have greater than 70 accuracy', async () => {
    const iris = new Iris();
    const { data, targets } = await iris.load();
    const { xTest, xTrain, yTest, yTrain } = train_test_split({
      X: data,
      y: targets,
      test_size: 0.33,
      train_size: 0.67,
      random_state: 42
    });
    const clf = new SGDClassifier({
      epochs: 10000,
      learning_rate: 0.000001,
      preprocess: null
    });
    clf.fit({ X: xTrain, y: yTrain });
    const result = clf.predict({ X: xTest });
    const accuracy = accuracyScore({
      y_pred: result,
      y_true: yTest
    });
    expect(accuracy).toBeGreaterThanOrEqual(accuracyExpected1);
  });
  it('Should throw exceptions on fit with invalid inputs', () => {
    const clf = new SGDClassifier();
    // X
    expect(() => clf.fit({ X: null, y: y1 })).toThrow('X must be a matrix');
    expect(() => clf.fit({ X: 1, y: y1 })).toThrow('X must be a matrix');
    expect(() => clf.fit({ X: 'test', y: y1 })).toThrow('X must be a matrix');

    // y
    expect(() => clf.fit({ X: X1, y: null })).toThrow('y must be a vector');
    expect(() => clf.fit({ X: X1, y: 1 })).toThrow('y must be a vector');
    expect(() => clf.fit({ X: X1, y: 'test' })).toThrow('y must be a vector');
  });

  it('Should throw exceptions on predict with invalid inputs', () => {
    const clf = new SGDClassifier();
    // X
    expect(() => clf.predict({ X: null })).toThrow('X must be a vector');
    expect(() => clf.predict({ X: 1 })).toThrow('X must be a vector');
    expect(() => clf.predict({ X: {} })).toThrow('X must be a vector');
  });
});

describe('linear_model:SGDRegressor', () => {
  const expected1 = [0.2314227830387089];
  it('should solve xor with default (50) epochs', () => {
    const reg = new SGDRegressor();
    reg.fit({ X: X1, y: y1 });
    const result = reg.predict({ X: [[2, 2]] });
    expect(result).toEqual(expected1);
  });
  it('Should throw exceptions on fit with invalid inputs', () => {
    const clf = new SGDRegressor();

    // X
    expect(() => clf.fit({ X: null, y: y1 })).toThrow('X must be a matrix');
    expect(() => clf.fit({ X: 1, y: y1 })).toThrow('X must be a matrix');
    expect(() => clf.fit({ X: 'test', y: y1 })).toThrow('X must be a matrix');

    // y
    expect(() => clf.fit({ X: X1, y: null })).toThrow('y must be a vector');
    expect(() => clf.fit({ X: X1, y: 1 })).toThrow('y must be a vector');
    expect(() => clf.fit({ X: X1, y: 'test' })).toThrow('y must be a vector');
  });

  it('Should throw exceptions on predict with invalid inputs', () => {
    const clf = new SGDRegressor();
    // X
    expect(() => clf.predict({ X: null })).toThrow('X must be a vector');
    expect(() => clf.predict({ X: 1 })).toThrow('X must be a vector');
    expect(() => clf.predict({ X: {} })).toThrow('X must be a vector');
  });
});
