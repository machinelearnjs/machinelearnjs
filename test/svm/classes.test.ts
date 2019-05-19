import { NuSVC, NuSVR, OneClassSVM, SVC, SVR } from '../../src/lib/svm';

describe('svm', () => {
  const xorFeatures = [[0, 0], [1, 1]];
  const xorLabels = [0, 1];
  const xorTest = [[1, 1]];

  describe('NuSVC', () => {
    const xorExpected = [1];
    it('should fit and predict XOR', () => {
      const svm = new NuSVC();
      svm.loadASM().then((loadedSVM) => {
        loadedSVM.fit(xorFeatures, xorLabels);
        const result = loadedSVM.predict(xorTest);
        expect(result).toEqual(xorExpected);
      });
    });

    it('should toJSON correct checkpoint', () => {
      const svm = new NuSVC();
      svm.loadASM().then((loadedSVM) => {
        loadedSVM.fit(xorFeatures, xorLabels);
        const checkpoint = loadedSVM.toJSON();
        const expectedOptions = {
          cacheSize: 100,
          coef0: 0,
          cost: 1,
          degree: 3,
          epsilon: 0.1,
          gamma: null,
          kernel: 'RBF',
          type: 'NU_SVC',
          nu: 0.5,
          probabilityEstimates: false,
          quiet: true,
          shrinking: true,
          tolerance: 0.001,
          weight: undefined,
        };
        expect(checkpoint).toMatchObject({ options: expectedOptions });
      });
    });

    it('should fromJSON and predict same', () => {
      const svm = new NuSVC();
      svm.loadWASM().then((loadedSVM) => {
        loadedSVM.fit(xorFeatures, xorLabels);
        const result = loadedSVM.predict(xorTest);
        expect(result).toEqual(xorExpected);
        const checkpoint = loadedSVM.toJSON();

        const svm2 = new NuSVC();
        svm2.loadWASM().then((loadedSVM2) => {
          loadedSVM2.fromJSON(checkpoint);
          const result2 = loadedSVM2.predict(xorTest);
          expect(result2).toEqual(xorExpected);
        });
      });
    });
  });

  describe('NuSVC', () => {
    const xorExpected = [0.8160602794142788];
    it('should fit and predict XOR', () => {
      const svm = new NuSVR();
      svm.loadASM().then((loadedSVM) => {
        loadedSVM.fit(xorFeatures, xorLabels);
        const result = loadedSVM.predict(xorTest);
        expect(result).toEqual(xorExpected);
      });
    });

    it('should toJSON correct checkpoint', () => {
      const svm = new NuSVR();
      svm.loadASM().then((loadedSVM) => {
        loadedSVM.fit(xorFeatures, xorLabels);
        const checkpoint = loadedSVM.toJSON();
        const expectedOptions = {
          cacheSize: 100,
          coef0: 0,
          cost: 1,
          degree: 3,
          epsilon: 0.1,
          gamma: null,
          kernel: 'RBF',
          type: 'NU_SVR',
          nu: 0.5,
          probabilityEstimates: false,
          quiet: true,
          shrinking: true,
          tolerance: 0.001,
          weight: undefined,
        };
        expect(checkpoint).toMatchObject({ options: expectedOptions });
      });
    });

    it('should fromJSON and predict same', () => {
      const svm = new NuSVR();
      svm.loadWASM().then((loadedSVM) => {
        loadedSVM.fit(xorFeatures, xorLabels);
        const result = loadedSVM.predict(xorTest);
        expect(result).toEqual(xorExpected);
        const checkpoint = loadedSVM.toJSON();

        const svm2 = new NuSVR();
        svm2.loadWASM().then((loadedSVM2) => {
          loadedSVM2.fromJSON(checkpoint);
          const result2 = loadedSVM2.predict(xorTest);
          expect(result2).toEqual(xorExpected);
        });
      });
    });
  });

  describe('OneClassSVM', () => {
    const xorExpected = [-1];
    it('should fit and predict XOR', () => {
      const svm = new OneClassSVM();
      svm.loadASM().then((loadedSVM) => {
        loadedSVM.fit(xorFeatures, xorLabels);
        const result = loadedSVM.predict(xorTest);
        expect(result).toEqual(xorExpected);
      });
    });

    it('should toJSON correct checkpoint', () => {
      const svm = new OneClassSVM();
      svm.loadASM().then((loadedSVM) => {
        loadedSVM.fit(xorFeatures, xorLabels);
        const checkpoint = loadedSVM.toJSON();
        const expectedOptions = {
          cacheSize: 100,
          coef0: 0,
          cost: 1,
          degree: 3,
          epsilon: 0.1,
          gamma: null,
          kernel: 'RBF',
          type: 'ONE_CLASS',
          nu: 0.5,
          probabilityEstimates: false,
          quiet: true,
          shrinking: true,
          tolerance: 0.001,
          weight: undefined,
        };
        expect(checkpoint).toMatchObject({ options: expectedOptions });
      });
    });

    it('should fromJSON and predict same', () => {
      const svm = new OneClassSVM();
      svm.loadWASM().then((loadedSVM) => {
        loadedSVM.fit(xorFeatures, xorLabels);
        const result = loadedSVM.predict(xorTest);
        expect(result).toEqual(xorExpected);
        const checkpoint = loadedSVM.toJSON();

        const svm2 = new OneClassSVM();
        svm2.loadWASM().then((loadedSVM2) => {
          loadedSVM2.fromJSON(checkpoint);
          const result2 = loadedSVM2.predict(xorTest);
          expect(result2).toEqual(xorExpected);
        });
      });
    });
  });

  describe('SVC', () => {
    const xorExpected = [1];
    it('should fit and predict XOR', () => {
      const svm = new SVC();
      svm.loadASM().then((loadedSVM) => {
        loadedSVM.fit(xorFeatures, xorLabels);
        const result = loadedSVM.predict(xorTest);
        expect(result).toEqual(xorExpected);
      });
    });

    it('should toJSON correct checkpoint', () => {
      const svm = new SVC();
      svm.loadASM().then((loadedSVM) => {
        loadedSVM.fit(xorFeatures, xorLabels);
        const checkpoint = loadedSVM.toJSON();
        const expectedOptions = {
          cacheSize: 100,
          coef0: 0,
          cost: 1,
          degree: 3,
          epsilon: 0.1,
          gamma: null,
          kernel: 'RBF',
          type: 'C_SVC',
          nu: 0.5,
          probabilityEstimates: false,
          quiet: true,
          shrinking: true,
          tolerance: 0.001,
          weight: undefined,
        };
        expect(checkpoint).toMatchObject({ options: expectedOptions });
      });
    });

    it('should fromJSON and predict same', () => {
      const svm = new SVC();
      svm.loadWASM().then((loadedSVM) => {
        loadedSVM.fit(xorFeatures, xorLabels);
        const result = loadedSVM.predict(xorTest);
        expect(result).toEqual(xorExpected);
        const checkpoint = loadedSVM.toJSON();

        const svm2 = new OneClassSVM();
        svm2.loadWASM().then((loadedSVM2) => {
          loadedSVM2.fromJSON(checkpoint);
          const result2 = loadedSVM2.predict(xorTest);
          expect(result2).toEqual(xorExpected);
        });
      });
    });
  });

  describe('SVR', () => {
    const xorExpected = [0.9000000057898799];
    it('should fit and predict XOR', () => {
      const svm = new SVR();
      svm.loadASM().then((loadedSVM) => {
        loadedSVM.fit(xorFeatures, xorLabels);
        const result = loadedSVM.predict(xorTest);
        expect(result).toEqual(xorExpected);
      });
    });

    it('should toJSON correct checkpoint', () => {
      const svm = new SVR();
      svm.loadASM().then((loadedSVM) => {
        loadedSVM.fit(xorFeatures, xorLabels);
        const checkpoint = loadedSVM.toJSON();
        const expectedOptions = {
          cacheSize: 100,
          coef0: 0,
          cost: 1,
          degree: 3,
          epsilon: 0.1,
          gamma: null,
          kernel: 'RBF',
          type: 'EPSILON_SVR',
          nu: 0.5,
          probabilityEstimates: false,
          quiet: true,
          shrinking: true,
          tolerance: 0.001,
          weight: undefined,
        };
        expect(checkpoint).toMatchObject({ options: expectedOptions });
      });
    });

    it('should fromJSON and predict same', () => {
      const svm = new SVR();
      svm.loadWASM().then((loadedSVM) => {
        loadedSVM.fit(xorFeatures, xorLabels);
        const result = loadedSVM.predict(xorTest);
        expect(result).toEqual(xorExpected);
        const checkpoint = loadedSVM.toJSON();

        const svm2 = new SVR();
        svm2.loadWASM().then((loadedSVM2) => {
          loadedSVM2.fromJSON(checkpoint);
          const result2 = loadedSVM2.predict(xorTest);
          expect(result2).toEqual(xorExpected);
        });
      });
    });
  });
});
