import * as _ from 'lodash';

export class LabelEncoder {
  private classes: Array<any>;
  public fit(X: Array<any> = null) {
    if (_.isEmpty(X)) {
      throw new Error('X cannot be empty!');
    }
    this.classes = _.uniq(X);
  }

  /**
   * Transforms labels using fitted classes
   * Given classes of ['amsterdam', 'paris', 'tokyo']
   * It transforms ["tokyo", "tokyo", "paris"]
   * Into [2, 2, 1]
   * @param X
   */
  public transform(X) {
    return _.map(X, item => {
      return _.findIndex(this.classes, cur => cur === item);
    });
  }
}
