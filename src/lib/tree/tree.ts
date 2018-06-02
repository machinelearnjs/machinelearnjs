import * as _ from 'lodash';

export class Question {
  private features = [];
  private column = null;
  private value = null;

  constructor(features = null, column, value) {
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
    if (!this.features) {
      throw Error('You must provide feature labels in order to render toString!');
    }
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

/**
 * A leaf node classifies data.
 *
 * It holds an object of data Class (e.g. Apple) -> count
 */
export class Leaf {
  public predictions = {};
  constructor(y) {
    this.predictions = classCounts(y);
  }
}

/**
 * It holds a reference to the question, and to the two children nodes
 */
export class DecisionNode {
  public question = null;
  public trueBranch = null;
  public falseBranch = null;

  constructor(question, trueBranch, falseBranch) {
    this.question = question;
    this.trueBranch = trueBranch;
    this.falseBranch = falseBranch;
  }
}

export class DecisionTreeClassifier {
  private featureLabels = null;

  constructor({ featureLabels = null }) {
    this.featureLabels = featureLabels;
  }
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
  ): { trueX: Array<any>, trueY: Array<any>, falseX: Array<any>, falseY: Array<any> } {
    let trueX = [];
    let trueY = [];
    let falseX = [];
    let falseY = [];
    const xLen = _.size(X);
    _.forEach(_.range(0, xLen), xIndex => {
      const row = X[xIndex];
      if (question.match(row)) {
        trueX.push(X[xIndex]);
        trueY.push(y[xIndex]);
      } else {
        falseX.push(X[xIndex]);
        falseY.push(y[xIndex]);
      }
    });

    return { trueX, trueY, falseX, falseY };
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

  public findBestSplit(X, y) {
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
        const question = new Question(this.featureLabels, col, feature);

        // Try splitting the dataset
        const { trueY, falseY } = this.partition(X, y, question);

        // Skip this dataset if it does not divide
        if (_.size(trueY) === 0 || _.size(falseY) === 0) {
          continue;
        }

        // Calculate information gained from this split
        const gain = this.infoGain(trueY, falseY, uncertainty);

        if (gain >= bestGain) {
          bestGain = gain;
          bestQuestion = question;
        }
      }
    }
    return { bestGain, bestQuestion };
  }

  private buildTree({ X, y }) {
    const { bestGain, bestQuestion } = this.findBestSplit(X, y);

    if (bestGain === 0) {
      return new Leaf(y);
    }

    // Partition the current passed in X ,y
    const { trueX, trueY, falseX, falseY } = this.partition(X, y, bestQuestion);

    // Recursively build the true branch
    const trueBranch = this.buildTree({ X: trueX, y: trueY });

    // Recursively build the false branch
    const falseBranch = this.buildTree({ X: falseX, y: falseY });

    return new DecisionNode(bestQuestion, trueBranch, falseBranch);
  }

  public fit({ X, y }) {
    return this.buildTree({ X, y });
  }

  public printTree({ node, spacing = "" }) {
    if (node instanceof Leaf) {
      console.log(spacing + "" + JSON.stringify(node.predictions));
      return;
    }

    // Print the question of the node
    console.log(spacing + node.question.toString());

    // Call this function recursively for true branch
    console.log(spacing, '--> True');
    this.printTree({ node: node.trueBranch, spacing: spacing + ' ' });

    // Call this function recursively for false branch
    console.log(spacing, '--> False');
    this.printTree({ node: node.falseBranch, spacing: spacing + ' ' });
  }
}
