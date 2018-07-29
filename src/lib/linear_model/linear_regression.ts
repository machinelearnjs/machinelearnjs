/**
 * References:
 * - https://machinelearningmastery.com/implement-simple-linear-regression-scratch-python/
 */
import { size } from 'lodash';
import math from '../utils/MathExtra';

export interface LinearRegressionModel {
  /**
   * Coefficients component: b0
   */
  b0: number;
  /**
   * Coefficients component: b1
   */
  b1: number;
}

/**
 * Ordinary least squares Linear Regression.
 *
 * @example
 * import { LinearRegression } from './linear_regression';
 * const linearRegression = new LinearRegression();
 * const X = [1, 2, 4, 3, 5];
 * const y = [1, 3, 3, 2, 5];
 * linearRegression.fit({ X, y });
 * console.log(lr.predict([1, 2]));
 * // [ 1.1999999999999995, 1.9999999999999996 ]
 */
export class LinearRegression {
  private b0: number;
  private b1: number;

  /**
   * fit linear model
   * @param {any} X - training values
   * @param {any} y - target values
   */
  public fit({ X = [], y = [] }: { X: number[]; y: number[] }): void {
    if (!Array.isArray(X) || !Array.isArray(y)) {
      throw new Error('X and y must be arrays');
    }

    if (size(X) !== size(y)) {
      throw new Error('X and y must be equal in size');
    }

    this.coefficients(X, y); // getting b0 and b1
  }

  /**
   * Predict using the linear model
   * @param {number} X - Values to predict.
   * @returns {number}
   */
  public predict(X: number[] = []): number[] {
    const preds = [];
    for (let i = 0; i < size(X); i++) {
      preds.push(this.b0 + this.b1 * X[i]);
    }
    return preds;
  }

  /**
   * Get the model details in JSON format
   * @returns {LinearRegressionModel}
   */
  public toJSON(): LinearRegressionModel {
    return {
      b0: this.b0,
      b1: this.b1
    };
  }

  /**
   * Restore the model from a checkpoint
   * @param {number} b0
   * @param {number} b1
   */
  public fromJSON({ b0 = null, b1 = null }: { b0: number; b1: number }): void {
    if (!b0 || !b1) {
      throw new Error('You must provide both b0 and b1 to restore Linear Regression');
    }
    this.b0 = b0;
    this.b1 = b1;
  }

  /**
   * Calculates coefficient for linear regression
   * @param X - X values
   * @param y - y targets
   */
  private coefficients(X, y): void {
    const xMean = math.mean(X);
    const yMean = math.mean(y);
    this.b1 = math.contrib.covariance(X, xMean, y, yMean) / math.contrib.variance(X, xMean);
    this.b0 = yMean - this.b1 * xMean;
  }
}
