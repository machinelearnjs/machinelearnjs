import * as _ from 'lodash';

export type Type = 'C_SVC' | 'NU_SVC' | 'ONE_CLASS' | 'EPSILON_SVR' | 'NU_SVR';

export type Kernel = 'LINEAR' | 'POLYNOMIAL' | 'RBF' | 'SIGMOID';

/**
 * Options used by sub classes
 * Notice type is disabled as they are set statically from children classes
 */
export interface SVMOptions {
  /**
   * Type of SVM
   */
  type?: Type;
  /**
   * Degree of polynomial, test for polynomial kernel
   */
  degree?: number;
  /**
   * Type of Kernel
   */
  kernel?: Kernel;
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
  weight?: object | null;
  /**
   * Print info during training if false (aka verbose)
   */
  quiet?: boolean;
}

/**
 * BaseSVM class used by all parent SVM classes that are based on libsvm
 */
export class BaseSVM {
  public static async create(options?: SVMOptions): Promise<BaseSVM> {
    if (!options.type) {
      throw new Error('Cannot create an SVM without a type.');
    }

    const SVM = await require('libsvm-js');
    const { kernel, type, ...rest } = {
      type: _.get(options, 'type', null),
      cacheSize: _.get(options, 'cacheSize', 100),
      coef0: _.get(options, 'coef0', 0),
      cost: _.get(options, 'cost', 1),
      degree: _.get(options, 'degree', 3),
      epsilon: _.get(options, 'epsilon', 0.1),
      gamma: _.get(options, 'gamma', null),
      kernel: _.get(options, 'kernel', 'RBF'),
      nu: _.get(options, 'nu', 0.5),
      probabilityEstimates: _.get(options, 'probabilityEstimates', false),
      quiet: _.get(options, 'quiet', true),
      shrinking: _.get(options, 'shrinking', true),
      tolerance: _.get(options, 'tolerance', 0.001),
      weight: _.get(options, 'weight', null)
    };

    const processedOptions = this.processOptions(SVM, rest, type, kernel);
    const svm = new SVM(processedOptions);

    return this.constructor(svm, processedOptions);
  }

  /**
   * Restores the model from a JSON checkpoint
   * @param {any} svm
   * @param {any} type
   * @param {any} options
   */
  public static async fromJSON(json: {
    svm: string;
    options: SVMOptions;
  }): Promise<BaseSVM> {
    const SVM = await require('libsvm-js');
    const svm = SVM.load(json.svm);

    return this.constructor(svm, json.options);
  }

  /**
   * Get Kernel name type using string Kernel name
   * @param SVM
   * @param {string} name
   * @returns {number}
   */
  private static getKernel(SVM, name: string): number {
    return _.get(SVM.KERNEL_TYPES, name);
  }

  /**
   * Get Kernel type using string type name
   * @param SVM
   * @param {string} name
   * @returns {number}
   */
  private static getType(SVM, name: string): number {
    return _.get(SVM.SVM_TYPES, name);
  }

  /**
   * Get a consolidated options including type and Kernel
   * @param SVM
   * @param {Options} options
   * @param {Type} type
   * @param {Kernel} kernel
   * @returns {Object}
   */
  private static processOptions(
    SVM,
    options: SVMOptions,
    type: Type,
    kernel: Kernel
  ): object {
    return _.flowRight(
      opts => {
        const foundType = this.getType(SVM, type);
        return _.set(opts, 'type', foundType);
      },
      opts => {
        const foundKernel = this.getKernel(SVM, kernel);
        return _.set(opts, 'kernel', foundKernel);
      }
    )(options);
  }

  protected svm: any;
  protected options: SVMOptions;

  constructor(svm: any, options: SVMOptions) {
    this.svm = svm;
    this.options = options;
  }

  /**
   * Fit the model according to the given training data.
   * @param {number[][]} X
   * @param {number[]} y
   * @returns {Promise<void>}
   */
  public async fit({
    X = [],
    y = []
  }: {
    X: number[][];
    y: number[];
  }): Promise<void> {
    return this.svm.train(X, y);
  }

  /**
   * Predict using the linear model
   * @param {number[][]} X
   * @returns {number[]}
   */
  public predict(X: number[][]): number[] {
    return this.svm.predict(X);
  }

  /**
   * Predict the label of one sample.
   * @param {number[]} X
   * @returns {number}
   */
  public predictOne(X: number[]): number {
    return this.svm.predictOne(X);
  }

  /**
   * Saves the current SVM as a JSON object
   * @returns {{svm: string; options: SVMOptions}}
   */
  public toJSON(): { svm: any; options: SVMOptions } {
    return {
      svm: this.svm.serializeModel(),
      options: this.options
    };
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
 */
export class SVC extends BaseSVM {
  public static async create(options?: SVMOptions): Promise<SVC> {
    return super.create({ ...options, type: 'C_SVC' });
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
 */
export class SVR extends BaseSVM {
  public static async create(options?: SVMOptions): Promise<SVR> {
    return super.create({ ...options, type: 'EPSILON_SVR' });
  }
}

/**
 * Unsupervised Outlier Detection.
 *
 * Estimate the support of a high-dimensional distribution.
 *
 * The implementation is based on libsvm.
 */
export class OneClassSVM extends BaseSVM {
  public static async create(options?: SVMOptions): Promise<OneClassSVM> {
    return super.create({ ...options, type: 'ONE_CLASS' });
  }
}

/**
 * Nu-Support Vector Classification.
 *
 * Similar to SVC but uses a parameter to control the number of support vectors.
 *
 * The implementation is based on libsvm.
 */
export class NuSVC extends BaseSVM {
  public static async create(options?: SVMOptions): Promise<NuSVC> {
    return super.create({ ...options, type: 'NU_SVC' });
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
 */
export class NuSVR extends BaseSVM {
  public static async create(options?: SVMOptions): Promise<NuSVR> {
    return super.create({ ...options, type: 'NU_SVR' });
  }
}
