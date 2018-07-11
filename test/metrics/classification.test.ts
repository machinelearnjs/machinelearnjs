import * as _ from 'lodash';
import {
  accuracyScore,
  confusion_matrix,
  zeroOneLoss,
} from '../../src/lib/metrics/classification';

describe('classification:accuracy_score', () => {
  const yTrue1 = [0, 1, 2, 3];
  const yPred1 = [0, 2, 1, 3];
  const yTrue2 = ['machine', 'learning', 'decision', 'tree'];
  const yPred2 = ['learning', 'machine', 'decision', 'tree'];

  it('should yTrue1 and yPred1 return 0.5', () => {
    const expectedResult = 0.5;
    const result = accuracyScore({
      y_pred: yPred1,
      y_true: yTrue1,
    });

    expect(result).toBe(expectedResult);
  });

  it('should yTrue1 and yPred1 with normalize:false return 2', () => {
    const expectedResult = 2;
    const result = accuracyScore({
      normalize: false,
      y_pred: yPred1,
      y_true: yTrue1,
    });

    expect(result).toBe(expectedResult);
  });

  it('should yTrue2 and yPred2 return 0.5', () => {
    const expectedResult = 0.5;
    const result = accuracyScore({
      y_pred: yPred2,
      y_true: yTrue2,
    });
    expect(result).toBe(expectedResult);
  });

  it('should yTrue2 and yPred2 with normalize:false ', () => {
    const expectedResult = 2;
    const result = accuracyScore({
      normalize: false,
      y_pred: yPred2,
      y_true: yTrue2,
    });
    expect(result).toBe(expectedResult);
  });

  it('should throw not equal in size exception', () => {
    expect(() => {
      accuracyScore({
        normalize: false,
        y_pred: yPred2,
        y_true: [1],
      });
    }).toThrow('y_true and y_pred are not equal in size!');
  });

  it('should y_true non-array should throw an error', () => {
    expect(() => {
      accuracyScore({
        normalize: false,
        y_pred: yPred2,
        y_true: true,
      });
    }).toThrow('y_true cannot be null or empty');
  });

  it('should y_pred non-array should throw an error', () => {
    expect(() => {
      accuracyScore({
        normalize: false,
        y_pred: 1,
        y_true: yTrue2,
      });
    }).toThrow('y_pred cannot be null or empty');
  });
});

describe('classification:zeroOneLoss', () => {
  const yTrue1 = [1, 2, 3, 4];
  const yPred1 = [2, 2, 3, 5];
  const yTrue2 = ['cat', 'ant', 'cat', 'cat', 'ant', 'bird'];
  const yPred2 = ['ant', 'ant', 'cat', 'cat', 'ant', 'cat'];

  it('should yTrue1 and yPred1 return 1', () => {
    const expectedResult = 0.5;
    const result = zeroOneLoss({
      y_pred: yPred1,
      y_true: yTrue1,
    });
    expect(result).toBe(expectedResult);
  });

  it('should yTrue2 and yPred2 return 0.33333333333333337', () => {
    const expectedResult = 0.33333333333333337;
    const result = zeroOneLoss({
      y_pred: yPred2,
      y_true: yTrue2,
    });
    expect(result).toBe(expectedResult);
  });

  it('should y_pred [1] and yTrue2 throw not equal size exception', () => {
    expect(() => {
      zeroOneLoss({
        y_pred: [1],
        y_true: yTrue2,
      });
    }).toThrow('y_true and y_pred are not equal in size!');
  });


  it('should y_true non-array should throw an error', () => {
    expect(() => {
      accuracyScore({
        normalize: false,
        y_pred: yPred2,
        y_true: true,
      });
    }).toThrow('y_true cannot be null or empty');
  });

  it('should y_pred non-array should throw an error', () => {
    expect(() => {
      accuracyScore({
        normalize: false,
        y_pred: 1,
        y_true: yTrue2,
      });
    }).toThrow('y_pred cannot be null or empty');
  });
});

describe('classification:confusion_matrix', () => {
  const yTrue1 = [1, 2, 3];
  const yPred1 = [1, 2, 3];
  const yTrue2 = [2, 0, 2, 2, 0, 1];
  const yPred2 = [0, 0, 2, 2, 0, 2];
  const yTrue3 = ['cat', 'ant', 'cat', 'cat', 'ant', 'bird'];
  const yPred3 = ['ant', 'ant', 'cat', 'cat', 'ant', 'cat'];

  it('should yTrue1 and yPred1 return [ [ 1, 0, 0 ], [ 0, 1, 0 ], [ 0, 0, 1 ] ]', () => {
    const expectedResult = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    const matrixResult = confusion_matrix({
      y_pred: yPred1,
      y_true: yTrue1
    });
    expect(_.isEqual(expectedResult, matrixResult)).toBe(true);
  });

  it('should yTrue2 and yPred2 return [ [ 1, 2, 0 ], [ 2, 0, 0 ], [ 0, 1, 0 ] ]', () => {
    const expectedResult = [[1, 2, 0], [2, 0, 0], [0, 1, 0]];
    const matrixResult = confusion_matrix({
      y_pred: yPred2,
      y_true: yTrue2
    });
    expect(_.isEqual(expectedResult, matrixResult)).toBe(true);
  });

  it('should yTrue3 and yPred3 return [ [ 1, 2, 0 ], [ 2, 0, 0 ], [ 0, 1, 0 ] ]', () => {
    const expectedResult = [[1, 2, 0], [2, 0, 0], [0, 1, 0]];
    const matrixResult = confusion_matrix({
      y_pred: yPred3,
      y_true: yTrue3
    });
    expect(_.isEqual(expectedResult, matrixResult)).toBe(true);
  });

  it('should throw an y_true empty exception', () => {
    expect(() => {
      confusion_matrix({ y_true: [], y_pred: [] });
    }).toThrow('y_true cannot be null or empty');
  });

  it('should throw y_pred empty exception', () => {
    expect(() => {
      confusion_matrix({ y_true: yTrue2, y_pred: [] });
    }).toThrow('y_pred cannot be null or empty');
  });
});
