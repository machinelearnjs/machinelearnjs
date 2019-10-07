import { BaggingClassifier } from '../../src/lib/ensemble';
import { LogisticRegression } from '../../src/lib/linear_model';
import { accuracyScore } from '../../src/lib/metrics';
import { ValidationError } from '../../src/lib/utils/Errors';
import { getHeartDisease } from '../data_testing';

describe('ensemble:BaggingClassifier', () => {
  it('Fails with ValidationError when maxSamples is float and is not in [0, 1] range', () => {
    try {
      const classifier = new BaggingClassifier({
        maxSamples: 1.1,
      });
      classifier.fit([1, 2, 3], [1, 1, 1]);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      expect(err.message).toEqual('maxSamplesIsFloat is true but number bigger than 1 was passed');
    }
  });

  it('Fails with ValidationError when maxSamples is integer and is bigger than number of samples', () => {
    const classifier = new BaggingClassifier({
      maxSamples: 3,
    });
    try {
      classifier.fit([[0], [1]], [1, 1]);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      expect(err.message).toEqual('maxSamplesIsFloat is true but number bigger than 1 was passed');
    }
  });

  it('Should train on X and predict 1 on test data', () => {
    const classifier = new BaggingClassifier({
      baseEstimator: LogisticRegression,
      maxSamples: 1.0,
    });
    const X = [[1], [2], [3], [4], [5]];
    const y = [1, 1, 1, 1, 1];
    const expected = [1, 1, 1, 1, 1];

    classifier.fit(X, y);

    const predictions = classifier.predict(X);
    expect(predictions).toEqual(expected);
  });

  it('Should train on heart disease dataset with logistic regression as base estimator', async () => {
    const { xTest, yTest } = await getHeartDisease();

    const classifier = new BaggingClassifier({
      baseEstimator: LogisticRegression,
      maxSamples: 0.9,
    });

    classifier.fit(xTest, yTest);

    const result = classifier.predict(xTest);
    const accuracy = accuracyScore(yTest, result);

    expect(accuracy).toBeGreaterThan(0.5);
  });

  it('should save and reload checkpoint, and still results same predictions', async () => {
    const { xTest, yTest } = await getHeartDisease();

    const cls1 = new BaggingClassifier({
      baseEstimator: LogisticRegression,
      maxSamples: 0.9,
    });
    cls1.fit(xTest, yTest);
    const checkpoint = cls1.toJSON();

    const cls2 = new BaggingClassifier();
    cls2.fromJSON(checkpoint);

    const result = cls2.predict(xTest);
    const accuracy = accuracyScore(yTest, result);

    expect(accuracy).toBeGreaterThan(0.5);
  });
});
