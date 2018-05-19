import svmResolver from 'libsvm-js';
import * as _ from 'lodash';

type Type = 'C_SVC' | 'NU_SVC' | 'ONE_CLASS' | 'EPSILON_SVR' | 'NU_SVR';

type Kernel = 'LINEAR' | 'POLYNOMIAL' | 'RBF' | 'SIGMOID';

enum Kernel {


}

/**
 * Options used by sub classes
 * Notice type is disabled as they are set statically from children classes
 */
interface Options {
	// type:Type;
	kernel:Kernel;
	degree:number;										// Degree of polynomial, for polynomial kernel
	gamma:number | null;							// Gamma parameter of the RBF, Polynomial and Sigmoid kernels. Default value is 1/num_features
	coef0:number;											// coef0 parameter for Polynomial and Sigmoid kernels
	cost:number;											// Cost parameter, for C SVC, Epsilon SVR and NU SVR
	nu:number;												// For NU SVC and NU SVR
	epsilon:number;										// For epsilon SVR
	cacheSize:number;									// Cache size in MB
	tolerance:number;									// Tolerance
	shrinking:boolean;								// Use shrinking euristics (faster),
	probabilityEstimates:boolean;			// weather to train SVC/SVR model for probability estimates,
	weight:number | null;							// Set weight for each possible class
	quiet:boolean;										// Print info during training if false (aka verbose)
}

class BaseSVM {
	// TODO: Create SVM type
	public svm: any;
	public options: Options;

	constructor(options: Options) {
		this.options = options;
	}

	public getKernel(SVM, name: string) {
		return _.get(SVM.KERNEL_TYPE, name);
	}

	public getType(SVM, name: string) {
		return _.get(SVM.SVM_TYPE, name);
	}

	public processOptions(options, type: Type, kernel: Kernel) {
		return _.flowRight(
			opts => _.set(opts, 'type', type),
			opts => _.set(opts, 'kernel', kernel)
		)(options)
	}

	async loadSVM() {
		return await svmResolver;
	}
}

export class SVC extends BaseSVM {
	public async fit({ X = [], y = [] }) {
		const SVM = await this.loadSVM();
		const options = this.processOptions(
			this.options,
			'C_SVC',
			this.options.kernel
		);
		this.svm = new SVM(options);
		this.svm.train(X, y);
	}

	public predict() {

	}
}