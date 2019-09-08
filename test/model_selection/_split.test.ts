import * as _ from 'lodash';
import { KFold, StratifiedShuffleSplit, train_test_split } from '../../src/lib/model_selection/_split';
import { ValidationError } from '../../src/lib/utils/Errors';

describe('_split:KFold', () => {
  const X1 = [[1], [2], [3], [4], [5], [6], [7], [8], [9], [10]];
  const y1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const X2 = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
  const y2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  it('Should k=2 fold range(1, 10) of numbers', () => {
    const kf = new KFold({ k: 2 });
    const expectedResult = [
      { trainIndex: [5, 6, 7, 8, 9], testIndex: [0, 1, 2, 3, 4] },
      { trainIndex: [0, 1, 2, 3, 4], testIndex: [5, 6, 7, 8, 9] },
    ];
    const splitResult = kf.split(X1, y1);
    expect(_.isEqual(expectedResult, splitResult)).toBe(true);
  });

  it('Should k=5 fold range(1, 10) of numbers', () => {
    const kf = new KFold({ k: 5 });
    const expectedResult = [
      { trainIndex: [2, 3, 4, 5, 6, 7, 8, 9], testIndex: [0, 1] },
      { trainIndex: [0, 1, 4, 5, 6, 7, 8, 9], testIndex: [2, 3] },
      { trainIndex: [0, 1, 2, 3, 6, 7, 8, 9], testIndex: [4, 5] },
      { trainIndex: [0, 1, 2, 3, 4, 5, 8, 9], testIndex: [6, 7] },
      { trainIndex: [0, 1, 2, 3, 4, 5, 6, 7], testIndex: [8, 9] },
    ];
    const splitResult = kf.split(X1, y1);
    expect(_.isEqual(expectedResult, splitResult)).toBe(true);
  });

  it('Should k=10 fold range(1, 10) of numbers', () => {
    const kf = new KFold({ k: 10 });
    const expectedResult = [
      { trainIndex: [1, 2, 3, 4, 5, 6, 7, 8, 9], testIndex: [0] },
      { trainIndex: [0, 2, 3, 4, 5, 6, 7, 8, 9], testIndex: [1] },
      { trainIndex: [0, 1, 3, 4, 5, 6, 7, 8, 9], testIndex: [2] },
      { trainIndex: [0, 1, 2, 4, 5, 6, 7, 8, 9], testIndex: [3] },
      { trainIndex: [0, 1, 2, 3, 5, 6, 7, 8, 9], testIndex: [4] },
      { trainIndex: [0, 1, 2, 3, 4, 6, 7, 8, 9], testIndex: [5] },
      { trainIndex: [0, 1, 2, 3, 4, 5, 7, 8, 9], testIndex: [6] },
      { trainIndex: [0, 1, 2, 3, 4, 5, 6, 8, 9], testIndex: [7] },
      { trainIndex: [0, 1, 2, 3, 4, 5, 6, 7, 9], testIndex: [8] },
      { trainIndex: [0, 1, 2, 3, 4, 5, 6, 7, 8], testIndex: [9] },
    ];
    const splitResult = kf.split(X1, y1);
    expect(_.isEqual(expectedResult, splitResult)).toBe(true);
  });

  it('Should k=10 fold range(1, 10) of string', () => {
    const kf = new KFold({ k: 10 });
    const expectedResult = [
      { trainIndex: [1, 2, 3, 4, 5, 6, 7, 8, 9], testIndex: [0] },
      { trainIndex: [0, 2, 3, 4, 5, 6, 7, 8, 9], testIndex: [1] },
      { trainIndex: [0, 1, 3, 4, 5, 6, 7, 8, 9], testIndex: [2] },
      { trainIndex: [0, 1, 2, 4, 5, 6, 7, 8, 9], testIndex: [3] },
      { trainIndex: [0, 1, 2, 3, 5, 6, 7, 8, 9], testIndex: [4] },
      { trainIndex: [0, 1, 2, 3, 4, 6, 7, 8, 9], testIndex: [5] },
      { trainIndex: [0, 1, 2, 3, 4, 5, 7, 8, 9], testIndex: [6] },
      { trainIndex: [0, 1, 2, 3, 4, 5, 6, 8, 9], testIndex: [7] },
      { trainIndex: [0, 1, 2, 3, 4, 5, 6, 7, 9], testIndex: [8] },
      { trainIndex: [0, 1, 2, 3, 4, 5, 6, 7, 8], testIndex: [9] },
    ];
    const splitResult = kf.split(X2, y2);
    expect(_.isEqual(expectedResult, splitResult)).toBe(true);
  });

  it('should k=50 of sample type 2 throw an k=50- greater than number of sample=10 error', () => {
    const kf = new KFold({ k: 50 });

    try {
      kf.split(X2, y2);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
    }
  });

  it('should k=50 of sample type 2 throw an k=50- greater than number of sample=10 error', () => {
    const kf = new KFold({ k: 50 });

    try {
      kf.split(X2, y2);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
    }
  });

  it('X and y size mismatch', () => {
    const kf = new KFold({ k: 50 });
    try {
      kf.split([1, 2, 3, 4, 5, 6, 7], [1, 2, 3]);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
    }
  });

  it('Should throw an error if K is less than 2', () => {
    try {
      const kf = new KFold({ k: 1 });
      kf.split();
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
    }
  });
});

describe('_split:train_test_split', () => {
  const X1 = [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9]];
  const y1 = [0, 1, 2, 3, 4];

  const X2 = [['one'], ['two'], ['three'], ['four'], ['five']];
  const y2 = ['a', 'b', 'c', 'd', 'e'];

  it('Should split X1 y1 with random_state: 42 test_size: .33 and train_size: .67', () => {
    const { xTrain, yTrain, xTest, yTest } = train_test_split(X1, y1, {
      random_state: 42,
      test_size: 0.33,
      train_size: 0.67,
    });

    expect(_.isEqual(xTrain, [[0, 1], [2, 3]])).toBe(true);
    expect(_.isEqual(yTrain, [0, 1])).toBe(true);
    expect(_.isEqual(xTest, [[4, 5], [6, 7]])).toBe(true);
    expect(_.isEqual(yTest, [2, 3])).toBe(true);
  });

  it('Should split X1, y1 with random_state 100 test_size: .50 train_size: .50', () => {
    const { xTrain, yTrain, xTest, yTest } = train_test_split(X1, y1, {
      random_state: 100,
      test_size: 0.5,
      train_size: 0.5,
    });

    expect(_.isEqual(xTrain, [[4, 5], [2, 3], [8, 9]])).toBe(true);
    expect(_.isEqual(yTrain, [2, 1, 4])).toBe(true);
    expect(_.isEqual(xTest, [[0, 1], [6, 7]])).toBe(true);
    expect(_.isEqual(yTest, [0, 3])).toBe(true);
  });

  it('Should use default test and train sizes', () => {
    const { xTrain, yTrain, xTest, yTest } = train_test_split(X1, y1);

    expect(_.isEqual(xTrain, [[6, 7], [0, 1], [8, 9], [4, 5]])).toBe(true);
    expect(_.isEqual(yTrain, [3, 0, 4, 2])).toBe(true);
    expect(_.isEqual(xTest, [[2, 3]])).toBe(true);
    expect(_.isEqual(yTest, [1])).toBe(true);
  });

  it('Should sum of test_size and train_size attempting to match the input size throw an error', () => {
    try {
      train_test_split(X1, y1, {
        random_state: 10,
        test_size: 0.11,
        train_size: 0.12,
      });
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
    }
  });

  it('Should split X2 y2 with random_state: 42 test_size: .33 and train_size: .67', () => {
    const { xTrain, yTrain, xTest, yTest } = train_test_split(X2, y2);

    expect(_.isEqual(xTrain, [['four'], ['one'], ['five'], ['three']])).toBe(true);
    expect(_.isEqual(yTrain, ['d', 'a', 'e', 'c'])).toBe(true);
    expect(_.isEqual(xTest, [['two']])).toBe(true);
    expect(_.isEqual(yTest, ['b'])).toBe(true);
  });
});

describe('_split:StratifiedShuffleSplit', () => {
  const X = [[1, 2], [3, 4], [1, 2], [3, 4], [1, 2], [3, 4]];
  const y = [0, 0, 0, 1, 1, 1];
  const sss = new StratifiedShuffleSplit(5, 0.5, 0.5, 0);
  it('Should split X2 y2 with random_state: 42 test_size: .33 and train_size: .67', () => {
    const [train, test] = sss.split(X, y);
    console.log(train, test); // tslint:disable-line
  });
});
