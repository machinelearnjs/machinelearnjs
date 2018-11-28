import * as _ from 'lodash';
import { NuSVC, NuSVR, OneClassSVM, SVC, SVR } from '../../src/lib/svm/classes';

jest.mock('libsvm-js', () => () => ({
  predict: (X: number[][]) => X[0],
  predictOne: (X: number[]) => X[0],
  train: (X, y) => ({ X, y })
}));

describe('svm:classes', () => {
  const X1 = [[-1, -1], [-2, -1], [1, 1], [2, 1]];
  const y1 = [-1, 1, 2, 2];

  it('should test SVC with X1 and y1, then return the same pred feed', () => {
    const svc = new SVC();
    return svc.fit({ X: X1, y: y1 }).then(() => {
      const feed = [-0.8, -1];
      const result = svc.predict([feed, feed]);
      expect(_.isEqual(result, feed)).toBe(true);
      const result2 = svc.predictOne(feed);
      expect(_.isEqual(result2, feed[0])).toBe(true);
    });
  });

  it('should test SVR with X1 and y1, then return the same pred feed', () => {
    const svr = new SVR();
    return svr.fit({ X: X1, y: y1 }).then(() => {
      const feed = [-0.8, -1];
      const result = svr.predict([feed, feed]);
      expect(_.isEqual(result, feed)).toBe(true);
      const result2 = svr.predictOne(feed);
      expect(_.isEqual(result2, feed[0])).toBe(true);
    });
  });

  it('should test OneClassSVM with X1 and y1, then return the same pred feed', () => {
    const ocv = new OneClassSVM();
    return ocv.fit({ X: X1, y: y1 }).then(() => {
      const feed = [-0.8, -1];
      const result = ocv.predict([feed, feed]);
      expect(_.isEqual(result, feed)).toBe(true);
      const result2 = ocv.predictOne(feed);
      expect(_.isEqual(result2, feed[0])).toBe(true);
    });
  });

  it('should test NuSVC with X1 and y1, then return the same pred feed', () => {
    const nusvc = new NuSVC();
    return nusvc.fit({ X: X1, y: y1 }).then(() => {
      const feed = [-0.8, -1];
      const result = nusvc.predict([feed, feed]);
      expect(_.isEqual(result, feed)).toBe(true);
      const result2 = nusvc.predictOne(feed);
      expect(_.isEqual(result2, feed[0])).toBe(true);
    });
  });

  it('should test NuSVR with X1 and y1, then return the same pred feed', () => {
    const nusvr = new NuSVR();
    return nusvr.fit({ X: X1, y: y1 }).then(() => {
      const feed = [-0.8, -1];
      const result = nusvr.predict([feed, feed]);
      expect(_.isEqual(result, feed)).toBe(true);
      const result2 = nusvr.predictOne(feed);
      expect(_.isEqual(result2, feed[0])).toBe(true);
    });
  });
});
