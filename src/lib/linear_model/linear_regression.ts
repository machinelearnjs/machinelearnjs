/**
 * References:
 * - https://machinelearningmastery.com/implement-simple-linear-regression-scratch-python/
 */
import * as tf from '@tensorflow/tfjs';
import * as numeric from 'numeric';
import { Type1DMatrix, Type2DMatrix } from '../types';
import { ValidationError } from '../utils/Errors';
import { reshape } from '../utils/tensors';
import { covariance, inferShape, variance } from '../utils/tensors';
import { validateMatrix2D } from '../utils/validation';

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
  private weightsTensor: [tf.Scalar, tf.Scalar] | tf.Tensor<tf.Rank.R1>;
  private type: TypeLinearReg = TypeLinearReg.MULTIVARIATE;

  /**
   * Synchronously fit linear model
   * @param {any} X - training values
   * @param {any} y - target values
   */
  public fit(
    X: Type1DMatrix<number> | Type2DMatrix<number> = null,
    y: Type1DMatrix<number> = null,
  ): [tf.Scalar, tf.Scalar] | tf.Tensor<tf.Rank.R1> {
    this.fitInternal(X, y);
    if (this.weightsTensor instanceof Array) {
      this.weightsTensor.forEach((t) => t.arraySync());
    } else {
      this.weightsTensor.arraySync();
    }

    return this.weightsTensor;
  }

  /**
   * Asynchronously fit linear model
   * @param {any} X - training values
   * @param {any} y - target values
   */
  public async fitAsync(
    X: Type1DMatrix<number> | Type2DMatrix<number> = null,
    y: Type1DMatrix<number> = null,
  ): Promise<[tf.Scalar, tf.Scalar] | tf.Tensor<tf.Rank.R1>> {
    this.fitInternal(X, y);
    if (this.weightsTensor instanceof Array) {
      await Promise.all(this.weightsTensor.map((t) => t.array()));
    } else {
      await this.weightsTensor.array();
    }

    return this.weightsTensor;
  }

  private fitInternal(X: Type1DMatrix<number> | Type2DMatrix<number> = null, y: Type1DMatrix<number> = null): void {
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
      this.weightsTensor = this.calculateUnivariateCoeff(X as Type1DMatrix<number>, y); // getting b0 and b1
    } else if (xShape.length === 2 && yShape.length === 1 && xShape[0] === yShape[0]) {
      this.type = TypeLinearReg.MULTIVARIATE;
      this.weightsTensor = this.calculateMultiVariateCoeff(X as Type2DMatrix<number>, y);
    } else {
      throw new ValidationError(`Sample(${xShape[0]}) and target(${yShape[0]}) sizes do not match`);
    }
  }

  /**
   * Synchronously predict using the linear model
   * @param {number} X - Values to predict.
   * @returns {number}
   */
  public predict(X: Type1DMatrix<number> | Type2DMatrix<number> = null): number[] {
    return this.predictInternal(X).arraySync() as number[];
  }

  /**
   * Asynchronously predict using the linear model
   * @param {number} X - Values to predict.
   * @returns {number}
   */
  public predictAsync(X: Type1DMatrix<number> | Type2DMatrix<number> = null): Promise<number[]> {
    return this.predictInternal(X).array() as Promise<number[]>;
  }

  private predictInternal(X: Type1DMatrix<number> | Type2DMatrix<number> = null): tf.Tensor<tf.Rank> {
    if (!Array.isArray(X)) {
      throw new ValidationError('Received a non-array argument for y');
    }

    const xShape = inferShape(X);

    if (xShape.length === 1 && this.type.toString() === TypeLinearReg.UNIVARIATE.toString()) {
      return this.univariatePredict(X as Type1DMatrix<number>);
    } else if (xShape.length === 2 && this.type.toString() === TypeLinearReg.MULTIVARIATE.toString()) {
      return this.multivariatePredict(X as Type2DMatrix<number>);
    } else {
      throw new ValidationError(
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
    weightsTensor: [tf.Scalar, tf.Scalar] | tf.Tensor<tf.Rank.R1>;
    /**
     * Type of the linear regression model
     */
    type: TypeLinearReg;
  } {
    return {
      weightsTensor: this.weightsTensor,
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
    weightsTensor = null,
    /**
     * Type of linear regression, it can be either UNIVARIATE or MULTIVARIATE
     */
    type = null,
  }: {
    weightsTensor: [tf.Scalar, tf.Scalar] | tf.Tensor<tf.Rank.R1>;
    type: TypeLinearReg;
  }): void {
    if (!weightsTensor || !type) {
      throw new Error('You must provide both weights and type to restore the linear regression model');
    }
    this.weightsTensor = weightsTensor;
    this.type = type;
  }

  /**
   * Univariate prediction
   * y = b0 + b1 * X
   *
   * @param X
   */
  private univariatePredict(X: Type1DMatrix<number> = null): tf.Tensor<tf.Rank> {
    const xWrapped = tf.tensor1d(X);

    return xWrapped.mul(this.weightsTensor[1]).add(this.weightsTensor[0]);
  }

  /**
   * Multivariate prediction
   * y = (b0 * X0) + (b1 * X1) + (b2 * X2) + ....
   *
   * @param X
   */
  private multivariatePredict(X: Type2DMatrix<number> = null): tf.Tensor<tf.Rank> {
    const xWrapped = tf.tensor2d(X);

    return xWrapped.dot(this.weightsTensor as tf.Tensor<tf.Rank.R1>);
  }

  /**
   * Calculates univariate coefficients for linear regression
   * @param X - X values
   * @param y - y targets
   */
  private calculateUnivariateCoeff(X: Type1DMatrix<number>, y: Type1DMatrix<number>): [tf.Scalar, tf.Scalar] {
    const xMean = tf.mean(X).asScalar();
    const yMean = tf.mean(y).asScalar();
    const b1 = covariance(tf.tensor1d(X), xMean, tf.tensor1d(y), yMean)
      .div(variance(tf.tensor1d(X), xMean))
      .asScalar();
    const b0 = yMean.sub(b1.mul(xMean)).asScalar();

    return [b0, b1];
  }

  /**
   * Calculate multivariate coefficients for linear regression
   * @param X
   * @param y
   */
  private calculateMultiVariateCoeff(X: Type2DMatrix<number>, y: Type1DMatrix<number>): tf.Tensor<tf.Rank.R1> {
    const [q, r] = tf.linalg.qr(tf.tensor2d(X));
    const rawR = reshape<number>(Array.from(r.dataSync()), r.shape);
    const validatedR = validateMatrix2D(rawR);
    return tf
      .tensor(numeric.inv(validatedR))
      .dot(q.transpose())
      .dot(tf.tensor(y)) as tf.Tensor<tf.Rank.R1>;
  }
}
