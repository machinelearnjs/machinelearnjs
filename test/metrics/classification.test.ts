import * as _ from 'lodash';
import { confusion_matrix } from '../../src/lib/metrics/classification';

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
      y_true: yTrue1,
      y_pred: yPred1
    });
    expect(_.isEqual(expectedResult, matrixResult)).toBe(true);
  });

  it('should yTrue2 and yPred2 return [ [ 1, 2, 0 ], [ 2, 0, 0 ], [ 0, 1, 0 ] ]', () => {
    const expectedResult = [[1, 2, 0], [2, 0, 0], [0, 1, 0]];
    const matrixResult = confusion_matrix({
      y_true: yTrue2,
      y_pred: yPred2
    });
    expect(_.isEqual(expectedResult, matrixResult)).toBe(true);
  });

  it('should yTrue3 and yPred3 return [ [ 1, 2, 0 ], [ 2, 0, 0 ], [ 0, 1, 0 ] ]', () => {
    const expectedResult = [[1, 2, 0], [2, 0, 0], [0, 1, 0]];
    const matrixResult = confusion_matrix({
      y_true: yTrue3,
      y_pred: yPred3
    });
    expect(_.isEqual(expectedResult, matrixResult)).toBe(true);
  });
});
