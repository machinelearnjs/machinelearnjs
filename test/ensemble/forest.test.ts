import { Iris } from '../../src/lib/datasets/Iris';
import { RandomForestClassifier } from '../../src/lib/ensemble/forest';
import { accuracyScore } from '../../src/lib/metrics';
import { train_test_split } from '../../src/lib/model_selection';

describe('ensemble:forest', () => {
  const X1 = [[0, 0], [1, 1], [2, 1], [1, 5], [3, 2]];
  const y1 = [0, 1, 2, 3, 7];
  describe('RandomForest', () => {
    it('should return a result of X1 and y1 with random state 1', () => {
      const randomForest = new RandomForestClassifier({ random_state: 1 });
      randomForest.fit({ X: X1, y: y1 });
      const result = randomForest.predict([[0, 3], [2, 1]]);
      const expected = [1, 2];
      expect(result).toEqual(expected);
    });

    it('should return a result of X1 and y1 with random state 2', () => {
      const randomForest = new RandomForestClassifier({ random_state: 2 });
      randomForest.fit({ X: X1, y: y1 });
      const result = randomForest.predict([[0, 3], [2, 1]]);
      const expected = [0, 2];
      expect(result).toEqual(expected);
    });

    it('should train test split and predict correct test #1', () => {
      const randomForest = new RandomForestClassifier();
      const dataset = new Iris();
      dataset.load();
      const { xTest, xTrain, yTest, yTrain } = train_test_split({ X: dataset.data, y: dataset.targets });
      randomForest.fit({ X: xTrain, y: yTrain });
      const yPred = randomForest.predict(xTest);
      const shouldBeGreater = 0.7;
      const accuracy = accuracyScore({ y_true: yTest, y_pred: yPred });
      expect(accuracy).toBeGreaterThanOrEqual(shouldBeGreater);
    });
  });
});
