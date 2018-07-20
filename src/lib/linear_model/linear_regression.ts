/**
 * References:
 * - https://machinelearningmastery.com/implement-simple-linear-regression-scratch-python/
 */
import { size } from 'lodash';
import math from '../utils/MathExtra';

interface LinearRegressionModel {
  b0: number;
  b1: number;
}

/**
 * Ordinary least squares Linear Regression.
 */
export class LinearRegression {
  private b0: number;
  private b1: number;

  /**
   * Calculates coefficient for linear regression
   * @param X
   * @param y
   */
  private coefficients(X, y) {
    const xMean = math.mean(X);
    const yMean = math.mean(y);
    this.b1 = math.contrib.covariance(X, xMean, y, yMean) / math.contrib.variance(X, xMean);
    this.b0 = yMean - this.b1 * xMean;
  }

  /**
   * fit linear model
   * @param {any} X
   * @param {any} y
   */
  public fit({ X, y }: { X: number[]; y: number[] }): void {
    this.coefficients(X, y); // getting b0 and b1
  }

  /**
   * Predict using the linear model
   * @param {number} X
   * @returns {number}
   */
  public predict(X: number[]): number[] {
    let preds = [];
    for (let i = 0; i < size(X); i++) {
      preds.push(this.b0 + this.b1 * X[i]);
    }
    return preds;
  }

  /**
   * Returns the current LinearRegression model
   * @returns {LinearRegressionModel}
   */
  public toJSON(): LinearRegressionModel {
    return {
      b0: this.b0,
      b1: this.b1
    };
  }
}
