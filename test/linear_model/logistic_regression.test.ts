import { LogisticRegression } from '../../src/lib/linear_model';
import { accuracyScore } from '../../src/lib/metrics';
import { getHeartDisease } from '../data_testing';

describe('linear_model:LogisticRegression', () => {
  describe('Multivariate', () => {
    it('Should train on X and y and predict 1 on test data', () => {
      const X = [[1], [2], [3], [4], [5]];
      const y = [1, 1, 1, 1, 1];
      const expected = [1, 1, 1, 1, 1];

      const lr: LogisticRegression = new LogisticRegression();
      lr.fit(X, y);
      const predictions = lr.predict(X);

      expect(predictions).toEqual(expected);
    });

    it('Should train on X and y and predict 0 on test data', () => {
      const X = [[1], [2], [3], [4], [5]];
      const y = [0, 0, 0, 0, 0];
      const expected = [0, 0, 0, 0, 0];

      const lr: LogisticRegression = new LogisticRegression();
      lr.fit(X, y);
      const predictions = lr.predict(X);

      expect(predictions).toEqual(expected);
    });

    it('Should throw error when number of training samples in X and y does not match', () => {
      const X = [[1], [2]];
      const y = [1];

      const lr: LogisticRegression = new LogisticRegression();

      expect(() => lr.fit(X, y)).toThrowError('Number of labels=1 does not math number of samples=2');
    });

    it('Should throw error when X test has incorrect number of features', () => {
      const xTrain = [[1, 2, 3], [4, 5, 6]];
      const yTrain = [1, 1];

      const lr: LogisticRegression = new LogisticRegression();
      lr.fit(xTrain, yTrain);

      const xTest = [[1, 2], [4, 5]];
      expect(() => lr.predict(xTest)).toThrowError(
        'Provided X has incorrect number of features. Should have: 3, got: 2',
      );
    });

    it('Should throw error when not every row in X has the same amount of features', () => {
      const xTrain = [[1, 2], [3, 4]];
      const yTrain = [1, 1];

      const lr = new LogisticRegression();
      lr.fit(xTrain, yTrain);

      const xTest = [[1, 2], [1]];

      expect(() => lr.predict(xTest)).toThrowError();
    });

    it('Should train on heart disease dataset and have at least 50% accuracy', async () => {
      const { xTest, yTest } = await getHeartDisease();

      const lr = new LogisticRegression();
      lr.fit(xTest, yTest);

      const result = lr.predict(xTest);
      const accuracy = accuracyScore(yTest, result);

      expect(accuracy).toBeGreaterThan(0.6);
    });
  });

  describe('Univariate', () => {
    it('Should train on X and y and predict 1 on test data', () => {
      const X = [1, 2, 3, 4, 5];
      const y = [1, 1, 1, 1, 1];
      const expected = [1, 1, 1, 1, 1];

      const lr: LogisticRegression = new LogisticRegression();
      lr.fit(X, y);
      const predictions = lr.predict(X);

      expect(predictions).toEqual(expected);
    });

    it('Should train on X and y and predict 0 on test data', () => {
      const X = [1, 2, 3, 4, 5];
      const y = [0, 0, 0, 0, 0];
      const expected = [0, 0, 0, 0, 0];

      const lr: LogisticRegression = new LogisticRegression();
      lr.fit(X, y);
      const predictions = lr.predict(X);

      expect(predictions).toEqual(expected);
    });

    it('Should throw error when number of training samples in X and y does not match', () => {
      const X = [1, 2];
      const y = [1];

      const lr: LogisticRegression = new LogisticRegression();

      expect(() => lr.fit(X, y)).toThrowError('Number of labels=1 does not math number of samples=2');
    });
  });
});
