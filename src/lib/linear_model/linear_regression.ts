/**
 * References:
 * - https://machinelearningmastery.com/implement-simple-linear-regression-scratch-python/
 */
import * as tf from '@tensorflow/tfjs';
import { size } from 'lodash';
import * as numeric from 'numeric';
import { Type1DMatrix, Type2DMatrix } from '../types';
import math from '../utils/MathExtra';
import { reshape } from '../utils/tensors';
import { inferShape } from '../utils/tensors';
import { validateMatrix2D } from '../utils/validation';
import {ValidationError} from "../utils/Errors";

/**
 * Type of Linear Regression
 * Univariate = It can handle a 1 dimensional input
 * Multivariate = It can handle a 2 dimensional input
 * @ignore
 */
export enum TypeLinearReg {
  UNIVARIATE = 'UNIVARIATE',
  MULTIVARIATE = 'MULTIVARIATE',
}

/**
 * Ordinary least squares Linear Regression.
 *
 * It supports both univariate and multivariate linear regressions.
 *
 * @example
 * import { LinearRegression } from './linear_regression';
 * const linearRegression = new LinearRegression();
 * const X = [1, 2, 4, 3, 5];
 * const y = [1, 3, 3, 2, 5];
 * linearRegression.fit(X, y);
 * lr.predict([1, 2]);
 * // [ 1.1999999999999995, 1.9999999999999996 ]
 *
 * const linearRegression2 = new LinearRegression();
 * const X2 = [[1, 1], [1, 2], [2, 2], [2, 3]];
 * const y2 = [1, 1, 2, 2];
 * linearRegression2.fit(X2, y2);
 * lr.predict([[1, 2]]);
 * // [1.0000001788139343]
 */
export class LinearRegression {
  private weights: number[] = [];
  private type: TypeLinearReg = TypeLinearReg.MULTIVARIATE;

  /**
   * fit linear model
   * @param {any} X - training values
   * @param {any} y - target values
   */
  public fit(
    X: Type1DMatrix<number> | Type2DMatrix<number> = null,
    y: Type1DMatrix<number> | Type2DMatrix<number> = null,
  ): void {
    if (!Array.isArray(X)) {
      throw new ValidationError('Received a non-array argument for X');
    }
    if (!Array.isArray(X) || !Array.isArray(y)) {
      throw new ValidationError('Received a non-array argument for y');
    }
    const xShape = inferShape(X);
    const yShape = inferShape(y);
    if (xShape.length === 1 && yShape.length === 1 && xShape[0] === yShape[0]) {
      // Univariate linear regression
      this.type = TypeLinearReg.UNIVARIATE;
      this.weights = this.calculateUnivariateCoeff(X, y); // getting b0 and b1
    } else if (xShape.length === 2 && yShape.length === 1 && xShape[0] === yShape[0]) {
      this.type = TypeLinearReg.MULTIVARIATE;
      this.weights = this.calculateMultiVariateCoeff(X, y);
    } else {
      throw new Error(`Sample(${xShape[0]}) and target(${yShape[0]}) sizes do not match`);
    }
  }
  /**
   * Predict using the linear model
   * @param {number} X - Values to predict.
   * @returns {number}
   */
  public predict(X: Type1DMatrix<number> | Type2DMatrix<number> = null): number[] {
    const xShape = inferShape(X);
    if (xShape.length === 1 && this.type.toString() === TypeLinearReg.UNIVARIATE.toString()) {
      return this.univariatePredict(X as Type1DMatrix<number>);
    } else if (xShape.length === 2 && this.type.toString() === TypeLinearReg.MULTIVARIATE.toString()) {
      return this.multivariatePredict(X as Type2DMatrix<number>);
    } else {
      throw new TypeError(
        `The matrix is incorrectly shaped: while X is ${xShape.length}, type is ${this.type.toString().toLowerCase()}`,
      );
    }
  }
  /**
   * Get the model details in JSON format
   */
  public toJSON(): {
    /**
     * Coefficients
     */
    weights: number[];
    /**
     * Type of the linear regression model
     */
    type: TypeLinearReg;
  } {
    return {
      weights: this.weights,
      type: this.type,
    };
  }

  /**
   * Restore the model from a checkpoint
   */
  public fromJSON({
    /**
     * Model's weights
     */
    weights = null,
    /**
     * Type of linear regression, it can be either UNIVARIATE or MULTIVARIATE
     */
    type = null,
  }: {
    weights: number[];
    type: TypeLinearReg;
  }): void {
    if (!weights || !type) {
      throw new Error('You must provide both weights and type to restore the linear regression model');
    }
    this.weights = weights;
    this.type = type;
  }

  /**
   * Univariate prediction
   * y = b0 + b1 * X
   *
   * @param X
   */
  private univariatePredict(X: Type1DMatrix<number> = null): number[] {
    const preds = [];
    for (let i = 0; i < size(X); i++) {
      preds.push(this.weights[0] + this.weights[1] * X[i]);
    }
    return preds;
  }

  /**
   * Multivariate prediction
   * y = (b0 * X0) + (b1 * X1) + (b2 * X2) + ....
   *
   * @param X
   */
  private multivariatePredict(X: Type2DMatrix<number> = null): number[] {
    const preds = [];
    for (let i = 0; i < X.length; i++) {
      const row = X[i];
      let yPred = 0;
      for (let j = 0; j < row.length; j++) {
        yPred += this.weights[j] * row[j];
      }
      preds.push(yPred);
    }
    return preds;
  }

  /**
   * Calculates univariate coefficients for linear regression
   * @param X - X values
   * @param y - y targets
   */
  private calculateUnivariateCoeff(X, y): number[] {
    const xMean: any = tf.mean(X).dataSync();
    const yMean: any = tf.mean(y).dataSync();
    const b1 = math.covariance(X, xMean, y, yMean) / math.variance(X, xMean);
    const b0 = yMean - b1 * xMean;
    return this.weights.concat([b0, b1]);
  }

  /**
   * Calculate multivariate coefficients for linear regression
   * @param X
   * @param y
   */
  private calculateMultiVariateCoeff(X, y): number[] {
    const [q, r] = tf.linalg.qr(tf.tensor2d(X));
    const rawR = reshape<number>(Array.from(r.dataSync()), r.shape);
    const validatedR = validateMatrix2D(rawR);
    const weights = tf
      .tensor(numeric.inv(validatedR))
      .dot(q.transpose())
      .dot(tf.tensor(y))
      .dataSync();
    return Array.from(weights);
  }
}
