import * as _ from 'lodash';

export class Question {
  private features = [];
  private column = null;
  private value = null;

  constructor(features, column, value) {
    this.features = features;
    this.column = column;
    this.value = value;
  }

  public match(example) {
    const val = example[this.column];
    if (_.isNumber(val)) {
      return val >= this.value;
    } else {
      return val === this.value;
    }
  }

  public toString(): string {
    const condition = _.isNumber(this.value) ? '>=' : '==';
    return `Is ${this.features[this.column]} ${condition} ${this.value}`;
  }
}

/**
 * According to the given targets array, count occurences into an object
 * Increment the value as they occur
 * @param targets
 * @returns {{}}
 */
export function classCounts(targets) {
  // TODO: If targets is a multi-dimensional, automatically grab -1 index
  return _.reduce(
    targets,
    (accum, target) => {
      const count = _.get(accum, target);
      if (_.isNumber(count) && count > 0) {
        return _.set(accum, target, count + 1);
      } else {
        return _.set(accum, target, 1);
      }
    },
    {}
  );
}

export class Leaf {
  public predictions = [];
  constructor(y) {
    this.predictions = classCounts(y);
  }
}

export class DecisionTreeClassifier {
  /**
   * Split rows into true and false according to quesiton.match result
   * @param X
   * @param y
   * @param {Question} question
   * @returns {{trueRows: Array; falseRows: Array}}
   */
  public partition(
    X,
    y,
    question: Question
  ): { trueRows: Array<any>; falseRows: Array<any> } {
    let trueRows = [];
    let falseRows = [];
    const xLen = _.size(X);
    _.forEach(_.range(0, xLen), xIndex => {
      const row = X[xIndex];
      if (question.match(row)) {
        trueRows.push(y[xIndex]);
      } else {
        falseRows.push(y[xIndex]);
      }
    });

    return { trueRows, falseRows };
  }

  /**
   * Calculate the gini impurity of rows
   * Checkout: https://en.wikipedia.org/wiki/Decision_tree_learning#Gini_impurity
   * @param targets
   */
  public gini(targets) {
    const counts = classCounts(targets);
    let impurity = 1;
    const keys = _.keys(counts);
    _.forEach(keys, key => {
      const count = _.get(counts, key);

      if (_.isNull(count)) {
        throw Error('Invalid class count detected!');
      }

      let probOfClass = count / _.size(targets);
      impurity -= Math.pow(probOfClass, 2);
    });
    return impurity;
  }

  /**
   * Information Gain.
   *
   * The uncertainty of the starting node, minus the weighted impurity of
   * two child nodes.
   * @param left
   * @param right
   * @param uncertainty
   * @returns {number}
   */
  public infoGain(left, right, uncertainty) {
    const p = _.size(left) / (_.size(left) + _.size(right));
    return uncertainty - p * this.gini(left) - (1 - p) * this.gini(right);
  }

  public findBestSplit(X, y, featureLabels) {
    const uncertainty = this.gini(y);
    const nFeatures = _.size(X[0]);
    let bestGain = 0;
    let bestQuestion = null;
    for (let col = 0; col < nFeatures; col++) {
      const uniqFeatureValues = _.uniqBy(_.map(X, row => row[col]), x => x);
      for (
        let featureIndex = 0;
        featureIndex < _.size(uniqFeatureValues);
        featureIndex++
      ) {
        const feature = uniqFeatureValues[featureIndex];
        const question = new Question(featureLabels, col, feature);

        // Try splitting the dataset
        const { trueRows, falseRows } = this.partition(X, y, question);

        // Skip this dataset if it does not divide
        if (_.size(trueRows) === 0 || _.size(falseRows) === 0) {
          continue;
        }

        // Calculate information gained from this split
        const gain = this.infoGain(trueRows, falseRows, uncertainty);

        if (gain >= bestGain) {
          bestGain = gain;
          bestQuestion = question;
        }
      }
    }
    return { bestGain, bestQuestion };
  }

  public fit() {}
}
