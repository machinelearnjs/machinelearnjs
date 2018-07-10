import * as SimpleLinearRegression from 'ml-regression-simple-linear';

/**
 * Ordinary least squares Linear Regression.
 */
export class LinearRegression {
  private lr: any = null;

  /**
   * fit linear model
   * @param {any} X
   * @param {any} y
   */
  public fit({ X, y }: { X: number[]; y: number[] }): void {
    this.lr = new SimpleLinearRegression(X, y);
  }

  /**
   * Predict using the linear model
   * @param {number} X
   * @returns {number}
   */
  public predict(X: number): number {
    return this.lr.predict(X);
  }
}
