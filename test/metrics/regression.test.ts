import { mean_squared_error } from '../../src/lib/metrics';
import { matchExceptionWithSnapshot } from '../util_testing';

describe('metrics:mean_squared_error', () => {
  const yTrue1 = [3, -0.5, 2, 7];
  const yPred1 = [2.5, 0.0, 2, 8];
  const yTrue2 = [[0.5, 1], [-1, 1], [7, -6]];
  const yPred2 = [[0, 2], [-1, 2], [8, -5]];
  it('should calculate MSE of yTrue1 and yPred1 then return 0.375', () => {
    const error = mean_squared_error(yTrue1, yPred1);
    expect(error).toBe(0.375);
  });

  it('should calculate MSE of yTure2 and yPred2 then return 0.7083333134651184', () => {
    const error = mean_squared_error(yTrue2, yPred2);
    expect(error).toBe(0.7083333134651184);
  });

  it("should throw an exception if inputs' shapes are different", () => {
    matchExceptionWithSnapshot(mean_squared_error, [yTrue2, [1, 2]]);
    matchExceptionWithSnapshot(mean_squared_error, [[1, 2], yTrue2]);
    matchExceptionWithSnapshot(mean_squared_error, [yTrue1, yTrue2]);
    matchExceptionWithSnapshot(mean_squared_error, [null, null]);
  });
});
