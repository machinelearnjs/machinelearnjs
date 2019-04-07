import { Lasso, Ridge } from '../../src/lib/linear_model';
import { ConstructionError, ValidationError } from '../../src/lib/utils/Errors';
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
    try {
      const reg = new Ridge({ l2: null } as any);
      reg.fit();
    } catch (err) {
      expect(err).toBeInstanceOf(ConstructionError);
    }
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
    try {
      const reg = new Lasso({ l1: null } as any);
      reg.fit();
    } catch (err) {
      expect(err).toBeInstanceOf(ConstructionError);
    }
    try {
      const reg = new Lasso({ degree: null } as any);
      reg.fit();
    } catch (err) {
      expect(err).toBeInstanceOf(ConstructionError);
    }
  });
});
