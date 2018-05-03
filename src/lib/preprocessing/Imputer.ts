import * as _ from 'lodash';
import math from '../utils/MathExtra';

export class Imputer {
  private missingValues: number | null;
  private strategy: string;
  private axis: number;
  private verbose: number;
  private copy: boolean;
  private means: Array<number>;

  /**
   *
   * @param {any} missingValues
   * @param {any} strategy
   * @param {any} axis   0 = column axis & 1 = row axis
   * @param {any} verbose
   * @param {any} copy
   */
  constructor({missingValues = null, strategy = 'mean', axis = 0, verbose = 0, copy = false}) {
    this.missingValues = missingValues;
    this.strategy = strategy;
    this.axis = axis;
    this.verbose = verbose;
    this.copy = copy;
    this.means = [];
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
   * @param {Array<string>} steps
   */
  private calcArrayMean = (matrix, steps: Array<string>) =>
    _.reduce(steps, (result, step) => {
      switch(step) {
        case 'flatten':
          return _.map(result, _.flatten);
        case 'filter':
          return _.map(result,
              // Expecting any type of matrics array
              // TODO: implement a correct type
              (arr: Array<any>) => {
                return _.filter(arr, z => z !== this.missingValues);
              });
        case 'mean':
          return _.map(result, _.mean);
      }
  }, matrix);

  public fit(X) {
    const rowLen = math.contrib.size(X, 0);
    const colLen = math.contrib.size(X, 1);
    const rowRange = math.contrib.range(0, rowLen);
    const colRange = math.contrib.range(0, colLen);
    if (this.strategy === 'mean') {
      if (this.axis === 0) {
        const colNumbers = _.map(colRange,
          (col) => math.subset(X, math.index(rowRange, col)));

        console.log(this.calcArrayMean(colNumbers, ['flatten', 'filter', 'mean']));
      } else if (this.axis === 1) {
        const rowNumbers = _.map(rowRange, (row) => _.get(X, `[${row}]`))
        console.log(this.calcArrayMean(rowNumbers, ['filter', 'mean']));
      }
      console.log(this.means);
      console.log('checking X', X);
    }
  }

  public fit_transform(X) {

  }
}