import { Lasso, Ridge } from '../../src/lib/linear_model';
import { getIris } from '../data_testing';
import { assertArrayAlmostEqual } from '../util_testing';
import { lasso_l2_snap, ridge_l1_snap } from './__snapshots__/manual_cd_regressor.snap';

describe('linear_model:Ridge', () => {
  it('should solve iris with 10000 epochs', async () => {
    jest.setTimeout(10000);
    const { xTest, xTrain, yTrain } = await getIris();
    const reg = new Ridge({
      l2: 1,
      epochs: 10000,
      learning_rate: 0.000001,
    });
    reg.fit(xTrain, yTrain);
    const result = reg.predict(xTest);
    assertArrayAlmostEqual(result, ridge_l1_snap, 2);
  });

  it('should solve iris with 5000 epochs', async () => {
    jest.setTimeout(10000);
    const { xTest, xTrain, yTrain } = await getIris();
    const reg = new Ridge({
      l2: 1,
      epochs: 5000,
      learning_rate: 0.000001,
    });
    reg.fit(xTrain, yTrain);
    const result = reg.predict(xTest);
    assertArrayAlmostEqual(result, ridge_l1_snap, 2);
  });

  it('should throw an error if l1 is null', () => {
    expect(() => new Ridge({ l2: null })).toThrow('Ridge cannot be initiated with null l2');
  });
});

describe('linear_model:Lasso', () => {
  it('should solve iris with 10000 epochs', async () => {
    jest.setTimeout(10000);
    const { xTest, xTrain, yTrain } = await getIris();
    const reg = new Lasso({
      degree: 2,
      l1: 1,
      epochs: 10000,
      learning_rate: 0.000001,
    });
    reg.fit(xTrain, yTrain);
    const result = reg.predict(xTest);
    assertArrayAlmostEqual(result, lasso_l2_snap, 2);
  });
  it('should solve iris with 5000 epochs', async () => {
    jest.setTimeout(10000);
    const { xTest, xTrain, yTrain } = await getIris();
    const reg = new Lasso({
      degree: 2,
      l1: 1,
      epochs: 5000,
      learning_rate: 0.000001,
    });
    reg.fit(xTrain, yTrain);
    const result = reg.predict(xTest);
    assertArrayAlmostEqual(result, lasso_l2_snap, 2);
  });
  it('should throw an error if degree or l1 is not provided', () => {
    expect(() => new Lasso({ l1: null })).toThrow('Lasso cannot be initiated with null l1');
    expect(() => new Lasso({ degree: null })).toThrow('Lasso cannot be initiated with null degree');
  });
});
