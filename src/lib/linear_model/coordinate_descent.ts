import { normalize, PolynomialFeatures } from '../preprocessing';
import { Type1DMatrix, Type2DMatrix } from '../types';
import { SGDRegressor, TypeLoss } from './stochastic_gradient';

/**
 * Linear least squares with l2 regularization.
 *
 * Mizimizes the objective function:
 *
 *
 * ||y - Xw||^2_2 + alpha * ||w||^2_2
 *
 *
 * This model solves a regression model where the loss function is the linear least squares function
 * and regularization is given by the l2-norm. Also known as Ridge Regression or Tikhonov regularization.
 * This estimator has built-in support for multi-variate regression (i.e., when y is a 2d-array of shape [n_samples, n_targets]).
 *
 * @example
 * import { Iris } from 'machinelearn/datasets';
 * import { Ridge } from 'machinelearn/linear_model';
 * (async function() {
 *   const irisData = new Iris();
 *   const {
 *     data,         // returns the iris data (X)
 *     targets,      // list of target values (y)
 *   } = await irisData.load(); // loads the data internally
 *
 *   const reg = new Ridge({ l2: 1 });
 *   reg.fit(data, target);
 *   reg.predict([[5.1,3.5,1.4,0.2]]);
 * })();
 *
 */
export class Ridge extends SGDRegressor {
  /**
   * @param l2 - Regularizer factor
   * @param epochs - Number of epochs
   * @param learning_rate - learning rate
   */
  constructor(
    {
      l2 = null,
      epochs = 1000,
      learning_rate = 0.001
    }: {
      l2: number;
      epochs?: number;
      learning_rate?: number;
    } = {
      l2: null,
      epochs: 1000,
      learning_rate: 0.001
    }
  ) {
    if (l2 === null) {
      throw TypeError('Ridge cannot be initiated with null l2');
    }

    super({
      reg_factor: { l2 },
      learning_rate,
      epochs,
      loss: TypeLoss.L2.toString()
    });
  }
}

/**
 * Linear Model trained with L1 prior as regularizer (aka the Lasso)
 *
 * The optimization objective for Lasso is:
 *
 * (1 / (2 * n_samples)) * ||y - Xw||^2_2 + alpha * ||w||_1
 *
 * Technically the Lasso model is optimizing the same objective function as the Elastic Net with l1_ratio value (no L2 penalty).
 *
 * @example
 * import { Iris } from 'machinelearn/datasets';
 * import { Lasso } from 'machinelearn/linear_model';
 * (async function() {
 *   const irisData = new Iris();
 *   const {
 *     data,         // returns the iris data (X)
 *     targets,      // list of target values (y)
 *   } = await irisData.load(); // loads the data internally
 *
 *   const reg = new Lasso({ degree: 2, l1: 1 });
 *   reg.fit(data, target);
 *   reg.predict([[5.1,3.5,1.4,0.2]]);
 * })();
 *
 */
export class Lasso extends SGDRegressor {
  private degree: number;

  /**
   * @param degree - Polynomial feature extraction degree
   * @param l1 - Regularizer factor
   * @param epochs - Number of epochs
   * @param learning_rate - Learning rate
   */
  constructor(
    {
      degree = null,
      l1,
      epochs = 1000,
      learning_rate = 0.001
    }: {
      degree: number;
      l1: number;
      epochs?: number;
      learning_rate?: number;
    } = {
      degree: null,
      l1: null,
      epochs: 1000,
      learning_rate: 0.001
    }
  ) {
    if (l1 === null) {
      throw TypeError('Lasso cannot be initiated with null l1');
    }
    if (degree === null) {
      throw TypeError('Lasso cannot be initiated with null degree');
    }
    super({
      reg_factor: { l1 },
      learning_rate,
      epochs,
      loss: TypeLoss.L1.toString()
    });
    this.degree = degree;
  }

  /**
   * Fit model with coordinate descent.
   * @param X - A matrix of samples
   * @param y - A vector of targets
   */
  public fit(
    X: Type2DMatrix<number> = null,
    y: Type1DMatrix<number> = null
  ): void {
    const polynomial = new PolynomialFeatures({ degree: this.degree });
    const newX = normalize(polynomial.transform(X));
    super.fit(newX, y);
  }

  /**
   * Predict using the linear model
   * @param X - A matrix of test data
   */
  public predict(X: Type2DMatrix<number> = null): number[] {
    const polynomial = new PolynomialFeatures({ degree: this.degree });
    const newX = normalize(polynomial.transform(X));
    return super.predict(newX);
  }
}
