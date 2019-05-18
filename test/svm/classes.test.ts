import { NuSVC, NuSVR, OneClassSVM, SVC, SVR } from '../../src/lib/svm';

describe('svm', () => {
  const xorFeatures = [[0, 0], [1, 1]];
  const xorLabels = [0, 1];
  const xorTest = [[1, 1]];
  describe('NuSVC', () => {
    it('should fit and predict XOR', () => {
      const svm = new NuSVC();
      svm.loadASM().then((loadedSVM) => {
        loadedSVM.fit(xorFeatures, xorLabels);
        const result = loadedSVM.predict(xorTest);
        expect(result).toEqual([1]);
      });
    });

    it('should toJSON correct checkpoint', () => {
      const svm = new NuSVC();
      svm.loadASM().then((loadedSVM) => {
        loadedSVM.fit(xorFeatures, xorLabels);
        console.log(loadedSVM.toJSON());
        expect(1).toBe(2);
      });
    });
  });

  // describe('NuSVR', () => {});
});
