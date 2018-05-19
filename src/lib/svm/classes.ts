import svmResolver from 'libsvm-js';
import * as _ from 'lodash';

export type Type = 'C_SVC' | 'NU_SVC' | 'ONE_CLASS' | 'EPSILON_SVR' | 'NU_SVR';

export type Kernel = 'LINEAR' | 'POLYNOMIAL' | 'RBF' | 'SIGMOID';

/**
 * Options used by sub classes
 * Notice type is disabled as they are set statically from children classes
 */
export interface Options {
	// type:Type;
	degree:number;										// Degree of polynomial, for polynomial kernel
	kernel:Kernel;
	gamma:number | null;							// Gamma parameter of the RBF, Polynomial and Sigmoid kernels. Default value is 1/num_features
	coef0:number;											// coef0 parameter for Polynomial and Sigmoid kernels
	cost:number;											// Cost parameter, for C SVC, Epsilon SVR and NU SVR
	nu:number;												// For NU SVC and NU SVR
	epsilon:number;										// For epsilon SVR
	cacheSize:number;									// Cache size in MB
	tolerance:number;									// Tolerance
	shrinking:boolean;								// Use shrinking euristics (faster),
	probabilityEstimates:boolean;			// weather to train SVC/SVR model for probability estimates,
	weight:object | null;							// Set weight for each possible class
	quiet:boolean;										// Print info during training if false (aka verbose)
}

export class BaseSVM {
	// TODO: Create SVM type
	public svm: any;
	public options: Options;

	constructor(options:Options = null) {
		this.options = {
			cacheSize: _.get(options, 'cacheSize', 100),
			coef0: _.get(options, 'coef0', 0),
			cost: _.get(options, 'cost', 1),
			degree: _.get(options, 'degree', 3),
			epsilon: _.get(options, 'epsilon', .1),
			gamma: _.get(options, 'gamma', null),
			kernel: _.get(options, 'kernel', 'RBF'),
			nu: _.get(options, 'nu', .5),
			probabilityEstimates: _.get(options, 'probabilityEstimates', false),
			quiet: _.get(options, 'quiet', true),
			shrinking: _.get(options, 'shrinking', true),
			tolerance: _.get(options, 'tolerance', .001),
			weight: _.get(options, 'weight', null),
		};
	}

	public getKernel(SVM, name: string): number {
		return _.get(SVM.KERNEL_TYPES, name);
	}

	public getType(SVM, name: string): number {
		return _.get(SVM.SVM_TYPES, name);
	}

	public processOptions(SVM, options: Options, type: Type, kernel: Kernel): object {
		return _.flowRight(
			opts => {
				const foundType = this.getType(SVM, type);
				return _.set(opts, 'type', foundType);
			},
			opts => {
				const foundKernal = this.getKernel(SVM, kernel);
				return _.set(opts, 'kernel', foundKernal)
			}
		)(options)
	}

	public async loadSVM(): Promise<any> {
		return svmResolver;
	}
}

export class SVC extends BaseSVM {
	public async fit({ X = [], y = [] }: { X: any[], y: any[] }): Promise<void> {
		const SVM = await this.loadSVM();
		const options = this.processOptions(
			SVM,
			this.options,
			'C_SVC',
			this.options.kernel
		);
		this.svm = new SVM(options);
		this.svm.train(X, y);
	}

	public predict(X: number[]): number[] {
		return this.svm.predict(X);
	}
}