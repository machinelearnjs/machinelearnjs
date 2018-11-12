import { Iris } from '../../src/lib/datasets';
import {
  SGDClassifier,
  SGDRegressor,
  TypeLoss
} from '../../src/lib/linear_model';
import { accuracyScore } from '../../src/lib/metrics';
import { train_test_split } from '../../src/lib/model_selection';
import { assertArrayAlmostEqual } from '../util_testing';
import {
  reg_l12_snap,
  reg_l1_snap,
  reg_l2_snap
} from './__snapshots__/manual_sgd_regressor.snap';

const X1 = [[0, 0], [1, 1]];
const y1 = [0, 1];

/**
 * Retrieves Iris dummy data for testing
 */
async function getIris(): Promise<{
  xTest: number[][];
  xTrain: number[][];
  yTest: number[];
  yTrain: number[];
}> {
  const iris = new Iris();
  const { data, targets } = await iris.load();
  const { xTest, xTrain, yTest, yTrain } = train_test_split(data, targets, {
    test_size: 0.33,
    train_size: 0.67,
    random_state: 42
  });
  return { xTest, xTrain, yTest, yTrain };
}

// Constant error messages
const tensorErr =
  'values passed to tensor(values) must be an array of numbers or booleans, or a TypedArray';

describe('linear_model:SGDClassifier', () => {
  const accuracyExpected1 = 0.5;
  it('should solve iris with 10000 epochs and have greater than 70 accuracy', async () => {
    const { xTest, xTrain, yTest, yTrain } = await getIris();

    const clf = new SGDClassifier({
      epochs: 10000,
      learning_rate: 0.000001
    });
    clf.fit(xTrain, yTrain);
    const result = clf.predict(xTest);
    const accuracy = accuracyScore({
      y_pred: result,
      y_true: yTest
    });
    expect(accuracy).toBeGreaterThanOrEqual(accuracyExpected1);
  });

  it('should still result in an accuracy greater than 70 wth l1 and l1l2', async () => {
    const { xTest, xTrain, yTest, yTrain } = await getIris();
    const clf_l1 = new SGDClassifier({
      epochs: 10000,
      learning_rate: 0.000001,
      loss: TypeLoss.L1
    });
    clf_l1.fit(xTrain, yTrain);
    const result = clf_l1.predict(xTest);
    const accuracy = accuracyScore({
      y_pred: result,
      y_true: yTest
    });
    expect(accuracy).toBeGreaterThanOrEqual(accuracyExpected1);

    const clf_l1l2 = new SGDClassifier({
      epochs: 10000,
      learning_rate: 0.000001,
      loss: TypeLoss.L1L2
    });
    clf_l1l2.fit(xTrain, yTrain);
    const result2 = clf_l1l2.predict(xTest);
    const accuracy2 = accuracyScore({
      y_pred: result2,
      y_true: yTest
    });
    expect(accuracy2).toBeGreaterThanOrEqual(accuracyExpected1);
  });

  it('should reload the model and predict the same', async () => {
    // Doubling the test timeout
    jest.setTimeout(10000);

    // Initial prediction
    const { xTest, xTrain, yTest, yTrain } = await getIris();

    const clf = new SGDClassifier({
      epochs: 10000,
      learning_rate: 0.000001
    });
    clf.fit(xTrain, yTrain);
    const result = clf.predict(xTest);
    const accuracy = accuracyScore({
      y_pred: result,
      y_true: yTest
    });
    expect(accuracy).toBeGreaterThanOrEqual(accuracyExpected1);

    // Model reloading
    const saveState = clf.toJSON();

    expect(saveState).not.toBeNull();
    expect(saveState).not.toBeUndefined();

    const clf2 = new SGDClassifier();
    clf2.fromJSON(saveState);

    const result2 = clf2.predict(xTest);
    const accuracy2 = accuracyScore({
      y_pred: result2,
      y_true: yTest
    });
    expect(accuracy2).toBeGreaterThanOrEqual(accuracyExpected1);
  });

  it('Should accept a static random state and pass the accuracy test', async () => {
    // Doubling the test timeout
    jest.setTimeout(10000);
    // Initial prediction
    const { xTest, xTrain, yTest, yTrain } = await getIris();

    const clf = new SGDClassifier({
      epochs: 10000,
      learning_rate: 0.000001,
      random_state: 123
    });

    clf.fit(xTrain, yTrain);
    const result = clf.predict(xTest);
    const accuracy = accuracyScore({
      y_pred: result,
      y_true: yTest
    });
    expect(accuracy).toBeGreaterThanOrEqual(accuracyExpected1);
  });

  it('Should throw exceptions on fit with invalid inputs', () => {
    const clf = new SGDClassifier();
    // X
    expect(() => clf.fit(null, y1)).toThrow(tensorErr);
    expect(() => clf.fit(1, y1)).toThrow(
      'The matrix is not 2D shaped: 1 of []'
    );
    expect(() => clf.fit('test', y1)).toThrow(tensorErr);

    // y
    expect(() => clf.fit(X1, null)).toThrow(tensorErr);
    expect(() => clf.fit(X1, 1)).toThrow(
      'The matrix is not 1D shaped: 1 of []'
    );
    expect(() => clf.fit(X1, 'test')).toThrow(tensorErr);
  });

  it('Should throw exceptions on predict with invalid inputs', () => {
    const clf = new SGDClassifier();
    // X
    expect(() => clf.predict(null)).toThrow(tensorErr);
    expect(() => clf.predict(1)).toThrow(
      'The matrix is not 2D shaped: 1 of []'
    );
    expect(() => clf.predict({})).toThrow(tensorErr);
  });
});

describe('linear_model:SGDRegressor', () => {
  const accuracyExpected1 = 50;

  it('should solve xor with default (50) epochs', async () => {
    const { xTest, xTrain, yTrain } = await getIris();
    const reg = new SGDRegressor();
    reg.fit(xTrain, yTrain);
    const result = reg.predict(xTest);
    const similarity = assertArrayAlmostEqual(reg_l2_snap, result, 1);
    expect(similarity).toBeGreaterThanOrEqual(accuracyExpected1);
  });
  it('should still result in an accuracy greater than 70 wth l1 and l1l2', async () => {
    jest.setTimeout(15000);
    const { xTest, xTrain, yTrain } = await getIris();
    const reg_l1 = new SGDRegressor({
      epochs: 10000,
      loss: TypeLoss.L1
    });
    reg_l1.fit(xTrain, yTrain);
    const result = reg_l1.predict(xTest);
    const similarity = assertArrayAlmostEqual(reg_l1_snap, result, 1);
    expect(similarity).toBeGreaterThanOrEqual(accuracyExpected1);

    const reg_l1l2 = new SGDRegressor({
      epochs: 10000,
      loss: TypeLoss.L1L2
    });
    reg_l1l2.fit(xTrain, yTrain);
    const result2 = reg_l1l2.predict(xTest);
    const similarity2 = assertArrayAlmostEqual(reg_l12_snap, result2, 1);
    expect(similarity2).toBeGreaterThanOrEqual(accuracyExpected1);
  });
  it('should reload the model and predict the same', async () => {
    // Doubling the test timeout
    jest.setTimeout(10000);
    const { xTest, xTrain, yTrain } = await getIris();

    // Initial prediction
    const reg = new SGDRegressor();
    reg.fit(xTrain, yTrain);
    const result = reg.predict(xTest);
    const similarity = assertArrayAlmostEqual(reg_l2_snap, result, 1);
    expect(similarity).toBeGreaterThanOrEqual(accuracyExpected1);

    const saveState = reg.toJSON();

    // Model reloading
    const reg2 = new SGDRegressor();
    reg2.fromJSON(saveState);
    const result2 = reg.predict(xTest);
    const similarity2 = assertArrayAlmostEqual(reg_l2_snap, result2, 1);
    expect(similarity2).toBeGreaterThanOrEqual(accuracyExpected1);
  });

  it('Should accept a static random state and pass the accuracy test', async () => {
    jest.setTimeout(10000);
    const { xTest, xTrain, yTrain } = await getIris();

    const reg = new SGDRegressor({
      random_state: 123
    });
    reg.fit(xTrain, yTrain);
    const result = reg.predict(xTest);
    const similarity = assertArrayAlmostEqual(reg_l2_snap, result, 1);
    expect(similarity).toBeGreaterThanOrEqual(accuracyExpected1);
  });

  it('Should throw exceptions on fit with invalid inputs', () => {
    const clf = new SGDRegressor();

    // X
    expect(() => clf.fit(null, y1)).toThrow(tensorErr);
    expect(() => clf.fit(1, y1)).toThrow(
      'The matrix is not 2D shaped: 1 of []'
    );
    expect(() => clf.fit('test', y1)).toThrow(tensorErr);

    // y
    expect(() => clf.fit(X1, null)).toThrow(tensorErr);
    expect(() => clf.fit(X1, 1)).toThrow(
      'The matrix is not 1D shaped: 1 of []'
    );
    expect(() => clf.fit(X1, 'test')).toThrow(tensorErr);
  });

  it('Should throw exceptions on predict with invalid inputs', () => {
    const clf = new SGDRegressor();
    // X
    expect(() => clf.predict(null)).toThrow(tensorErr);
    expect(() => clf.predict(1)).toThrow(
      'The matrix is not 2D shaped: 1 of []'
    );
    expect(() => clf.predict({})).toThrow(tensorErr);
  });
});
