import { LogisticRegression } from '../../src/lib/linear_model';
import { accuracyScore } from '../../src/lib/metrics';
import { ValidationClassMismatch, ValidationError, ValidationInconsistentShape } from '../../src/lib/utils/Errors';
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
      try {
        lr.fit(X, y);
      } catch (err) {
        expect(err).toBeInstanceOf(ValidationClassMismatch);
      }
    });

    it('Should throw error when X test has incorrect number of features', () => {
      const xTrain = [[1, 2, 3], [4, 5, 6]];
      const yTrain = [1, 1];

      const lr: LogisticRegression = new LogisticRegression();
      lr.fit(xTrain, yTrain);

      const xTest = [[1, 2], [4, 5]];
      try {
        lr.predict(xTest);
      } catch (err) {
        expect(err).toBeInstanceOf(ValidationError);
      }
    });

    it('Should throw error when not every row in X has the same amount of features', () => {
      const xTrain = [[1, 2], [3, 4]];
      const yTrain = [1, 1];

      const lr = new LogisticRegression();
      lr.fit(xTrain, yTrain);

      const xTest = [[1, 2], [1]];
      try {
        lr.predict(xTest);
      } catch (err) {
        expect(err).toBeInstanceOf(ValidationInconsistentShape);
      }
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
      try {
        lr.fit(X, y);
      } catch (err) {
        expect(err).toBeInstanceOf(ValidationClassMismatch);
      }
    });
  });

  describe('Async', () => {
    it('Should train on heart disease dataset and have the same accuracy as sync model', async () => {
      const { xTest, yTest } = await getHeartDisease();

      const syncLR = new LogisticRegression();
      syncLR.fit(xTest, yTest);

      const syncLRResult = syncLR.predict(xTest);
      const syncLRAccuracy = accuracyScore(yTest, syncLRResult);

      const asyncLR = new LogisticRegression();
      await asyncLR.fitAsync(xTest, yTest);
      const asyncLRResult = await asyncLR.predictAsync(xTest);
      const asyncLRAccuracy = accuracyScore(yTest, asyncLRResult);

      expect(Math.abs(syncLRAccuracy - asyncLRAccuracy)).toBeCloseTo(0.0, 1);
    });
  });
});
