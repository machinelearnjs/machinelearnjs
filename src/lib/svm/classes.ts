import { SVM } from 'libsvm-ts';
import * as _ from 'lodash';
import { IMlModel, Type1DMatrix, Type2DMatrix } from '../types';
import { validateFitInputs, validateMatrix1D, validateMatrix2D } from '../utils/validation';

/**
 * Options used by sub classes
 * Notice type is disabled as they are set statically from children classes
 */
export interface SVMOptions {
  /**
   * Degree of polynomial, test for polynomial kernel
   */
  degree?: number;
  /**
   * Type of Kernel
   */
  kernel?: string;
  /**
   * Type of SVM
   */
  type?: string;
  /**
   * Gamma parameter of the RBF, Polynomial and Sigmoid kernels. Default value is 1/num_features
   */
  gamma?: number | null;
  /**
   * coef0 parameter for Polynomial and Sigmoid kernels
   */
  coef0?: number;
  /**
   * Cost parameter, for C SVC, Epsilon SVR and NU SVR
   */
  cost?: number;
  /**
   * For NU SVC and NU SVR
   */
  nu?: number;
  /**
   * For epsilon SVR
   */
  epsilon?: number;
  /**
   * Cache size in MB
   */
  cacheSize?: number;
  /**
   * Tolerance
   */
  tolerance?: number;
  /**
   * Use shrinking euristics (faster)
   */
  shrinking?: boolean;
  /**
   * weather to train SVC/SVR model for probability estimates,
   */
  probabilityEstimates?: boolean;
  /**
   * Set weight for each possible class
   */
  weight?: {
    [n: number]: number;
  };
  /**
   * Print info during training if false (aka verbose)
   */
  quiet?: boolean;
}

/**
 * BaseSVM class used by all parent SVM classes that are based on libsvm.
 * You may still use this to use the underlying libsvm-ts more flexibly.
 */
export class BaseSVM implements IMlModel<number> {
  protected svm: SVM;
  protected options: SVMOptions;

  constructor(options?: SVMOptions) {
    this.options = {
      cacheSize: _.get(options, 'cacheSize', 100),
      coef0: _.get(options, 'coef0', 0),
      cost: _.get(options, 'cost', 1),
      degree: _.get(options, 'degree', 3),
      epsilon: _.get(options, 'epsilon', 0.1),
      gamma: _.get(options, 'gamma', null),
      kernel: _.get(options, 'kernel', 'RBF'),
      type: _.get(options, 'type', 'C_SVC'),
      nu: _.get(options, 'nu', 0.5),
      probabilityEstimates: _.get(options, 'probabilityEstimates', false),
      quiet: _.get(options, 'quiet', true),
      shrinking: _.get(options, 'shrinking', true),
      tolerance: _.get(options, 'tolerance', 0.001),
      weight: _.get(options, 'weight', undefined),
    };
    this.svm = new SVM(this.options);
  }

  /**
   * Loads a WASM version of SVM. The method returns the instance of itself as a promise result.
   */
  public loadWASM(): Promise<BaseSVM> {
    return this.svm.loadWASM().then((wasmSVM) => {
      this.svm = wasmSVM;
      return Promise.resolve(this);
    });
  }

  /**
   * Loads a ASM version of SVM. The method returns the instance of itself as a promise result.
   */
  public loadASM(): Promise<BaseSVM> {
    return this.svm.loadASM().then((asmSVM) => {
      this.svm = asmSVM;
      return Promise.resolve(this);
    });
  }

  /**
   * Fit the model according to the given training data.
   * @param {number[][]} X
   * @param {number[]} y
   * @returns {Promise<void>}
   */
  public fit(X: Type2DMatrix<number>, y: Type1DMatrix<number>): void {
    validateFitInputs(X, y);
    this.svm.train({
      samples: X,
      labels: y,
    });
  }

  /**
   * Predict using the linear model
   * @param {number[][]} X
   * @returns {number[]}
   */
  public predict(X: Type2DMatrix<number>): number[] {
    validateMatrix2D(X);
    return this.svm.predict({ samples: X });
  }

  /**
   * Predict the label of one sample.
   * @param {number[]} X
   * @returns {number}
   */
  public predictOne(X: Type1DMatrix<number>): number {
    validateMatrix1D(X);
    return this.svm.predictOne({ sample: X });
  }

  /**
   * Saves the current SVM as a JSON object
   * @returns {{svm: SVM; options: SVMOptions}}
   */
  public toJSON(): { svm: SVM; options: SVMOptions } {
    return {
      svm: this.svm,
      options: this.options,
    };
  }

  /**
   * Restores the model from a JSON checkpoint
   * @param {SVM} svm
   * @param {any} options
   */
  public fromJSON({ svm = null, options = null }): void {
    if (!svm || !options) {
      throw new Error('You must provide svm, type and options to restore the model');
    }

    this.svm = svm;
    this.options = options;
  }
}

/**
 * C-Support Vector Classification.
 *
 * The implementation is based on libsvm. The fit time complexity is more than
 * quadratic with the number of samples which makes it hard to scale to dataset
 * with more than a couple of 10000 samples.
 *
 * The multiclass support is handled according to a one-vs-one scheme.
 *
 * For details on the precise mathematical formulation of the provided kernel
 * functions and how gamma, coef0 and degree affect each other, see the corresponding
 * section in the narrative documentation: Kernel functions.
 *
 * @example
 * import { SVC } from 'machinelearn/svm';
 *
 * const svm = new SVC();
 * svm.loadASM().then((loadedSVM) => {
 *   loadedSVM.fit([[0, 0], [1, 1]], [0, 1]);
 *   loadedSVM.predict([[1, 1]]);   // [1]
 * });
 */
export class SVC extends BaseSVM {
  constructor(options?: SVMOptions) {
    super({
      ...options,
      type: 'C_SVC',
    });
  }
}

/**
 * Linear Support Vector Regression.
 *
 * Similar to SVR with parameter kernel=’linear’, but implemented in terms of
 * liblinear rather than libsvm, so it has more flexibility in the choice of
 * penalties and loss functions and should scale better to large numbers of samples.
 *
 * This class supports both dense and sparse input.
 *
 * @example
 * import { SVR } from 'machinelearn/svm';
 *
 * const svm = new SVR();
 * svm.loadASM().then((loadedSVM) => {
 *   loadedSVM.fit([[0, 0], [1, 1]], [0, 1]);
 *   loadedSVM.predict([[1, 1]]);   // [0.9000000057898799]
 * });
 */
export class SVR extends BaseSVM {
  constructor(options?: SVMOptions) {
    super({
      ...options,
      type: 'EPSILON_SVR',
    });
  }
}

/**
 * Unsupervised Outlier Detection.
 *
 * Estimate the support of a high-dimensional distribution.
 *
 * The implementation is based on libsvm.
 *
 * @example
 * import { OneClassSVM } from 'machinelearn/svm';
 *
 * const svm = new OneClassSVM();
 * svm.loadASM().then((loadedSVM) => {
 *   loadedSVM.fit([[0, 0], [1, 1]], [0, 1]);
 *   loadedSVM.predict([[1, 1]]);   // [-1]
 * });
 */
export class OneClassSVM extends BaseSVM {
  constructor(options?: SVMOptions) {
    super({
      ...options,
      type: 'ONE_CLASS',
    });
  }
}

/**
 * Nu-Support Vector Classification.
 *
 * Similar to SVC but uses a parameter to control the number of support vectors.
 *
 * The implementation is based on libsvm.
 *
 * @example
 * import { NuSVC } from 'machinelearn/svm';
 *
 * const svm = new NuSVC();
 * svm.loadASM().then((loadedSVM) => {
 *   loadedSVM.fit([[0, 0], [1, 1]], [0, 1]);
 *   loadedSVM.predict([[1, 1]]);   // [1]
 * });
 */
export class NuSVC extends BaseSVM {
  constructor(options?: SVMOptions) {
    super({
      ...options,
      type: 'NU_SVC',
    });
  }
}

/**
 * Nu Support Vector Regression.
 *
 * Similar to NuSVC, for regression, uses a parameter nu to control the number
 * of support vectors. However, unlike NuSVC, where nu replaces C, here nu
 * replaces the parameter epsilon of epsilon-SVR.
 *
 * The implementation is based on libsvm.
 *
 * @example
 * import { NuSVR } from 'machinelearn/svm';
 *
 * const svm = new NuSVR();
 * svm.loadASM().then((loadedSVM) => {
 *   loadedSVM.fit([[0, 0], [1, 1]], [0, 1]);
 *   loadedSVM.predict([[1, 1]]);   // [0.9000000057898799]
 * });
 */
export class NuSVR extends BaseSVM {
  constructor(options?: SVMOptions) {
    super({
      ...options,
      type: 'NU_SVR',
    });
  }
}
