import * as SimpleLinearRegression from 'ml-regression-simple-linear';

export class LinearRegression {
  private lr: any = null;

  public fit({ X, y }): void {
    this.lr = new SimpleLinearRegression(X, y);
  }

  public predict(predictX): number {
    return this.lr.predict(predictX);
  }
}
