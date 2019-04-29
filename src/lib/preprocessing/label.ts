import { findIndex, map, uniq } from 'lodash';
import { Type1DMatrix } from '../types';
import { validateMatrix1D } from '../utils/validation';

/**
 * Encode labels with value between 0 and n_classes-1.
 *
 * @example
 * import { LabelEncoder } from 'machinelearn/preprocessing';
 *
 * const labelEncoder = new LabelEncoder();
 * const labelX = ['amsterdam', 'paris', 'tokyo'];
 * labelEncoder.fit(labelX);
 * const transformX = ['tokyo', 'tokyo', 'paris'];
 * const result = labelEncoder.transform(transformX);
 * // [ 2, 2, 1 ]
 */
export class LabelEncoder {
  private classes: any[];

  /**
   * Fit label encoder
   * @param {any[]} X - Input data in array or matrix
   */
  public fit(X: Type1DMatrix<any> = null): void {
    validateMatrix1D(X);
    this.classes = uniq(X);
  }

  /**
   * Transform labels to normalized encoding.
   *
   * Given classes of ['amsterdam', 'paris', 'tokyo']
   *
   * It transforms ["tokyo", "tokyo", "paris"]
   *
   * Into [2, 2, 1]
   * @param X - Input data to transform according to the fitted state
   */
  public transform(X: Type1DMatrix<any> = null): any[] {
    validateMatrix1D(X);
    return map(X, (item) => {
      return findIndex(this.classes, (cur) => cur === item);
    });
  }
}
