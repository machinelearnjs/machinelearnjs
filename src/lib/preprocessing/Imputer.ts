import * as _ from 'lodash';
import { validateMatrix2D } from '../ops';
import { Type2DMatrix } from '../types';
import math from '../utils/MathExtra';

/**
 * Imputation transformer for completing missing values.
 *
 * @example
 * import { Imputer } from 'preprocessing/Imputer';
 *
 * const testX = [[1, 2], [null, 3], [7, 6]];
 * const imp = new Imputer({ missingValues: null, axis: 0 });
 * imp.fit(testX);
 * const impResult = imp.fit_transform([[null, 2], [6, null], [7, 6]]);
 * // [ [ 4, 2 ], [ 6, 3.6666666666666665 ], [ 7, 6 ] ]
 */
export class Imputer {
  private missingValues: number | null;
  private strategy: string;
  private axis: number;
  // private verbose: number;
  private copy: boolean;
  private means: number[];

  /**
   *
   * @param {any} missingValues - Target missing value to impute
   * @param {any} strategy - Missing value replacement strategy
   * @param {any} axis - Direction to impute
   * @param {any} copy - To clone the input value
   */
  constructor({
    missingValues = null,
    strategy = 'mean',
    axis = 0,
    // verbose = 0,
    copy = false
  }) {
    this.missingValues = missingValues;
    this.strategy = strategy;
    this.axis = axis;
    // this.verbose = verbose;
    this.copy = copy;
    this.means = [];
  }

  /**
   * Fit the imputer on X.
   * @param {any[]} X - Input data in array or sparse matrix format
   */
  public fit(X: Type2DMatrix<any> = null): void {
    validateMatrix2D(X);

    const _X = this.copy ? _.clone(X) : X;
    const rowLen = math.contrib.size(_X, 0);
    const colLen = math.contrib.size(_X, 1);
    const rowRange = math.contrib.range(0, rowLen);
    const colRange = math.contrib.range(0, colLen);
    if (this.strategy === 'mean') {
      if (this.axis === 0) {
        const colNumbers: any = _.map(colRange, col =>
          math.contrib.subset(_X, rowRange, [col])
        );
        this.means = this.calcArrayMean(colNumbers, [
          'flatten',
          'filter',
          'mean'
        ]);
      } else if (this.axis === 1) {
        const rowNumbers = _.map(rowRange, row => _.get(_X, `[${row}]`));
        this.means = this.calcArrayMean(rowNumbers, ['filter', 'mean']);
      }
    } else {
      throw new Error(`Unsupported strategy ${this.strategy} was given`);
    }
  }

  /**
   * Fit to data, then transform it.
   * @param {any[]} X - Input data in array or sparse matrix format
   * @returns {any[]}
   */
  public fit_transform(X: Type2DMatrix<any> = null): any[] {
    validateMatrix2D(X);

    const _X: any[] = _.clone(X);
    if (this.strategy === 'mean' && this.axis === 0) {
      // Mean column direction transform
      for (let row = 0; row < _.size(_X); row++) {
        for (let col = 0; col < _.size(_X[row]); col++) {
          const value = _X[row][col];
          _X[row][col] = value === this.missingValues ? this.means[row] : value;
        }
      }
    } else if (this.strategy === 'mean' && this.axis === 1) {
      // Mean row direction transform
      for (let row = 0; row < _.size(_X); row++) {
        for (let col = 0; col < _.size(_X[row]); col++) {
          const value = _X[row][col];
          _X[row][col] = value === this.missingValues ? this.means[col] : value;
        }
      }
    } else {
      throw new Error(
        `Unknown transformation with strategy ${this.strategy} and axis ${
          this.axis
        }`
      );
    }
    return _X;
  }

  /**
   * Calculate array of numbers as array of mean values
   * Examples:
   * [ [ 1, 2 ], [ null, 3 ], [ 123, 3 ] ]
   * => [ 1.5, 3, 63 ]
   *
   * [ [ 1, 123 ], [ 2, 3, 3 ] ]
   * => [ 62, 2.6666666666666665 ]
   *
   * @param matrix
   * @param {string[]} steps
   */
  private calcArrayMean = (matrix: any, steps: string[]): any =>
    // TODO: Fix any return type
    // TODO: Fix matrix type any
    _.reduce(
      steps,
      (result, step: string) => {
        switch (step) {
          case 'flatten':
            return _.map(result, _.flatten);
          case 'filter':
            return _.map(
              result,
              // Expecting any type of matrics array
              // TODO: implement a correct type
              (arr: any[]) => {
                return _.filter(arr, z => z !== this.missingValues);
              }
            );
          case 'mean':
            return _.map(result, _.mean);
          default:
            return result;
        }
      },
      matrix
    );
}
