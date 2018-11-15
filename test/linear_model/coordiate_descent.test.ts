import { Ridge } from '../../src/lib/linear_model';
import { getIris } from '../data_testing';
import { assertArrayAlmostEqual } from '../util_testing';
import { ridge_l1_snap } from './__snapshots__/manual_cd_regressor.snap';

describe('linear_model:Ridge', () => {
  it('should solve iris with 10000 epochs', async () => {
    const { xTest, xTrain, yTrain } = await getIris();
    const clf = new Ridge({
      l1: 1,
      epochs: 10000,
      learning_rate: 0.000001
    });
    clf.fit(xTrain, yTrain);
    const result = clf.predict(xTest);
    assertArrayAlmostEqual(result, ridge_l1_snap, 2);
  });

  it('should solve iris with 5000 epochs', async () => {
    const { xTest, xTrain, yTrain } = await getIris();
    const clf = new Ridge({
      l1: 1,
      epochs: 5000,
      learning_rate: 0.000001
    });
    clf.fit(xTrain, yTrain);
    const result = clf.predict(xTest);
    assertArrayAlmostEqual(result, ridge_l1_snap, 2);
  });
});
