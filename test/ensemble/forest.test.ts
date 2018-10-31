import fakeFetch from 'jest-fetch-mock';
import { Iris } from '../../src/lib/datasets';
import { RandomForestClassifier } from '../../src/lib/ensemble';
import { accuracyScore } from '../../src/lib/metrics';
import { train_test_split } from '../../src/lib/model_selection';
import { IRIS_FAKE_DATA, IRIS_FAKE_DESC } from '../datasets/fake_data/iris';

// Mock fetch
global.fetch = fakeFetch;

describe('ensemble:forest', () => {
  const accuracyTarget = 0.5;
  const X1 = [[0, 0], [1, 1], [2, 1], [1, 5], [3, 2]];
  const y1 = [0, 1, 2, 3, 7];
  describe('RandomForest', () => {
    it('should return a result of X1 and y1 with random state 1', () => {
      const randomForest = new RandomForestClassifier({ random_state: 1 });
      randomForest.fit(X1, y1);
      const result = randomForest.predict([[0, 3], [2, 1]]);
      const expected = [1, 2];
      expect(result).toEqual(expected);
    });

    it('should return a result of X1 and y1 with random state 2', () => {
      const randomForest = new RandomForestClassifier({ random_state: 2 });
      randomForest.fit(X1, y1);
      const result = randomForest.predict([[0, 3], [2, 1]]);
      const expected = [0, 2];
      expect(result).toEqual(expected);
    });

    it('should train test split and predict correct test #1', async () => {
      fetch.resetMocks();
      // data mock
      fetch.mockResponseOnce(IRIS_FAKE_DATA);
      // desc mock
      fetch.mockResponseOnce(IRIS_FAKE_DESC);

      const iris = new Iris();
      const { data, targets } = await iris.load();
      const randomForest = new RandomForestClassifier();
      const { xTest, xTrain, yTest, yTrain } = train_test_split({
        X: data,
        y: targets
      });
      randomForest.fit(xTrain, yTrain);
      const yPred = randomForest.predict(xTest);
      const accuracy = accuracyScore({ y_true: yTest, y_pred: yPred });
      expect(accuracy).toBeGreaterThanOrEqual(accuracyTarget);
    });
  });
});
