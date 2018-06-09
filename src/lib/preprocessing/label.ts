import * as _ from 'lodash';

/**
 * Encode labels with value between 0 and n_classes-1.
 */
export class LabelEncoder {
  private classes: any[];

	/**
   * Fit label encoder
	 * @param {any[]} X
	 */
  public fit(X: any[] = null): void {
    if (_.isEmpty(X)) {
      throw new Error('X cannot be empty!');
    }
    this.classes = _.uniq(X);
  }

  /**
   * Transform labels to normalized encoding.
   *
   * Given classes of ['amsterdam', 'paris', 'tokyo']
   *
   * It transforms ["tokyo", "tokyo", "paris"]
   *
   * Into [2, 2, 1]
   * @param X
   */
  public transform(X): any[] {
    return _.map(X, item => {
      return _.findIndex(this.classes, cur => cur === item);
    });
  }
}
