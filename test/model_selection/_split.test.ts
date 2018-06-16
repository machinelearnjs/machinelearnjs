import * as _ from 'lodash';
import { KFold } from '../../src/lib/model_selection/_split';

describe('_split:KFold', () => {
  const X1 = [[1], [2], [3], [4], [5], [6], [7], [8], [9], [10]];
  const y1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const X2 = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
  const y2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  it('Should k=2 fold range(1, 10) of numbers', () => {
    const kf = new KFold({ k: 2 });
    const expectedResult = [
      { trainIndex: [5, 6, 7, 8, 9], testIndex: [0, 1, 2, 3, 4] },
      { trainIndex: [0, 1, 2, 3, 4], testIndex: [5, 6, 7, 8, 9] }
    ];
    const splitResult = kf.split({ X: X1, y: y1 });
    expect(_.isEqual(expectedResult, splitResult)).toBe(true);
  });

  it('Should k=5 fold range(1, 10) of numbers', () => {
    const kf = new KFold({ k: 5 });
    const expectedResult = [
      { trainIndex: [2, 3, 4, 5, 6, 7, 8, 9], testIndex: [0, 1] },
      { trainIndex: [0, 1, 4, 5, 6, 7, 8, 9], testIndex: [2, 3] },
      { trainIndex: [0, 1, 2, 3, 6, 7, 8, 9], testIndex: [4, 5] },
      { trainIndex: [0, 1, 2, 3, 4, 5, 8, 9], testIndex: [6, 7] },
      { trainIndex: [0, 1, 2, 3, 4, 5, 6, 7], testIndex: [8, 9] }
    ];
    const splitResult = kf.split({ X: X1, y: y1 });
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
      { trainIndex: [0, 1, 2, 3, 4, 5, 6, 7, 8], testIndex: [9] }
    ];
    const splitResult = kf.split({ X: X1, y: y1 });
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
      { trainIndex: [0, 1, 2, 3, 4, 5, 6, 7, 8], testIndex: [9] }
    ];
    const splitResult = kf.split({ X: X2, y: y2 });
    expect(_.isEqual(expectedResult, splitResult)).toBe(true);
  });

  it('should k=50 of sample type 2 throw an k=50- greater than number of sample=10 error', () => {
    const kf = new KFold({ k: 50 });
    expect(() => {
      kf.split({ X: X2, y: y2 });
    }).toThrow(
      'Cannot have number of splits k=50 greater than the number of samples: 10'
    );
  });

  it('should k=50 of sample type 2 throw an k=50- greater than number of sample=10 error', () => {
    const kf = new KFold({ k: 50 });
    expect(() => {
      kf.split({ X: X2, y: y2 });
    }).toThrow(
      'Cannot have number of splits k=50 greater than the number of samples: 10'
    );
  });

  it('X and y size mismatch', () => {
    const kf = new KFold({ k: 50 });
    expect(() => {
      kf.split({
        X: [1, 2, 3, 4, 5, 6, 7],
        y: [1, 2, 3]
      });
    }).toThrow('X and y must have an identical size');
  });

  it('Should throw an error if K is less than 2', () => {
    expect(() => new KFold({ k: 1 }))
      .toThrow('Number of folds cannot be less than 2');
  });
});

