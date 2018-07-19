import * as _ from 'lodash';

export interface Options {
  featureLabels?: null | any[];
  verbose?: boolean;
  randomise?: boolean;
}

/**
 * Question used by decision tree algorithm to determine whether to split branch or not
 * @ignore
 */
export class Question {
  private features = [];
  private column = null;
  private value = null;

  constructor(features = null, column, value) {
    this.features = features;
    this.column = column;
    this.value = value;
  }

  public match(example): boolean {
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
 * According to the given targets array, count occurrences into an object.
 * Also it increment the value as they occur.
 * @param {any[]} targets - list of classes
 * @returns {}
 * @ignore
 */
export function classCounts(targets): {} {
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
 * It holds an object of data Class (e.g. Apple) -> count
 * @ignore
 */
export class Leaf {
  public predictions = [];
  constructor(y) {
    // this.predictions = classCounts(y);
    this.predictions = y;
  }
}

/**
 * It holds a reference to the question, and to the two children nodes
 * @ignore
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

/**
 * A decision tree classifier.
 *
 * @example
 * import { DecisionTreeClassifier } from 'kalimdor/tree';
 * const features = ['color', 'diameter', 'label'];
 * const decision = new DecisionTreeClassifier({ featureLabels: features });
 *
 * const X = [['Green', 3], ['Yellow', 3], ['Red', 1], ['Red', 1], ['Yellow', 3]];
 * const y = ['Apple', 'Apple', 'Grape', 'Grape', 'Lemon'];
 * decision.fit({ X, y });
 * decision.printTree(); // try it out yourself! =)
 *
 * decision.predictOne({ row: X[0] }); // [ 'Apple' ]
 * decision.predict({ X }); // [ [ 'Apple' ], [ 'Apple', 'Lemon' ], [ 'Grape', 'Grape' ], [ 'Grape', 'Grape' ], [ 'Apple', 'Lemon' ] ]
 *
 * @example
 * import { DecisionTreeClassifier } from 'kalimdor/tree';
 * const decision = new DecisionTreeClassifier({ featureLabels: null });
 *
 * const X = [[0, 0], [1, 1]];
 * const Y = [0, 1];
 * decision.fit({ X, y });
 * decision2.predictOne({ row: [2, 2] }); // [ 1 ]
 */
export class DecisionTreeClassifier {
  private featureLabels = null;
  private tree = null;
  private verbose = true;
  private randomise = false;

  constructor(options: Options) {
    this.featureLabels = _.get(options, 'featureLabels', null);
    this.verbose = _.get(options, 'verbose', false);
    this.randomise = _.get(options, 'randomise', false);
  }

  /**
   * Fit date, which builds a tree
   * @param {any} X
   * @param {any} y
   * @returns {Leaf | DecisionNode}
   */
  public fit({ X, y }: { X: any[]; y: any[] }): void {
    // this.y = y;
    if (!X || !y || !_.isArray(X) || !_.isArray(y) || _.isEmpty(X) || _.isEmpty(y)) {
      throw Error('Cannot accept non Array values for X and y');
    }
    this.tree = this.buildTree({ X, y });
  }

  /**
   * Predict one row
   * @param {any} row
   * @returns any[any[]]}
   */
  public predictOne({ row }: { row: any }): any {
    // TODO: Fix any return type

    return this._predict({ row, node: this.tree });
  }

  /**
   * Predict multiple rows
   * @param {any[]} X
   * @returns {any[]}
   */
  public predict({ X }: { X: any[] }): any {
    if (!_.isArray(X)) {
      throw Error('X need to be an array!');
    }
    // TODO: Fix any return type
    return _.map(X, row => {
      return this._predict({ row, node: this.tree });
    });
    // TODO: Return accuracies as well
  }

  /**
   * Measure accuracy between actual row (X) vs predicted rows
   * @param {any} actualRows
   * @param {any} predRows
   * @returns {number}
   */
  public accuracyMetrics({ actualRows, predRows }): number {
    let correct = 0;
    const actualRowsLen = _.size(actualRows);
    const predRowsLen = _.size(predRows);
    if (actualRowsLen !== predRowsLen) {
      throw Error('Actual rows and predicted rows are different in length');
    }
    const predRowsRange = _.range(0, predRowsLen);
    correct = _.reduce(
      predRowsRange,
      (sum, index) => {
        if (_.isEqual(actualRows[index], predRows[index])) {
          return sum + 1;
        }
        return sum;
      },
      correct
    );
    return correct / actualRowsLen * 100.0;
  }

  /**
   * Recursively print the tree into console
   * @param {string} spacing
   */
  public printTree(spacing: string = ''): void {
    if (!this.tree) {
      throw new Error('You cannot print an empty tree');
    }
    this._printTree({ node: this.tree, spacing });
  }

  /**
   * Partition X and y into true and false branches
   * @param X
   * @param y
   * @param {Question} question
   * @returns {{trueX: Array<any>; trueY: Array<any>; falseX: Array<any>; falseY: Array<any>}}
   */
  private partition(
    X,
    y,
    question: Question
  ): {
    trueX: any[];
    trueY: any[];
    falseX: any[];
    falseY: any[];
  } {
    const trueX = [];
    const trueY = [];
    const falseX = [];
    const falseY = [];
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
   * @returns {number}
   */
  private gini(targets): number {
    const counts = classCounts(targets);
    let impurity = 1;
    const keys = _.keys(counts);
    _.forEach(keys, key => {
      const count = _.get(counts, key);

      if (_.isNull(count)) {
        throw Error('Invalid class count detected!');
      }

      const probOfClass = count / _.size(targets);
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
  private infoGain(left, right, uncertainty): number {
    const p = _.size(left) / (_.size(left) + _.size(right));
    return uncertainty - p * this.gini(left) - (1 - p) * this.gini(right);
  }

  /**
   * Find the best split for the current X and y.
   * @param X
   * @param y
   * @param {boolean} randomise
   * @returns {{bestGain: number; bestQuestion: any}}
   */
  private findBestSplit(X, y): { bestGain: number; bestQuestion: Question } {
    const uncertainty = this.gini(y);
    const nFeatures = _.size(X[0]);
    let bestGain = 0;
    let bestQuestion = null;

    let features = [];
    if (this.randomise) {
      // a list of features is created by randomly selecting feature indices and adding them to a list
      while (features.length < nFeatures) {
        const index = _.random(nFeatures);
        if (!_.includes(features, index)) {
          features.push(index);
        }
      }
    } else {
      features = _.range(0, _.size(X[0]));
    }
    _.forEach(features, col => {
      const uniqFeatureValues = _.uniqBy(_.map(X, row => row[col]), x => x);
      _.forEach(uniqFeatureValues, feature => {
        const question = new Question(this.featureLabels, col, feature);

        // Try splitting the dataset
        const { trueY, falseY } = this.partition(X, y, question);

        // Skip this dataset if it does not divide
        if (_.size(trueY) === 0 || _.size(falseY) === 0) {
          return;
        }

        // Calculate information gained from this split
        const gain = this.infoGain(trueY, falseY, uncertainty);
        if (this.verbose) {
          console.info(`fn: ${col} fval: ${feature} gini: ${gain}`);
        }
        if (gain >= bestGain) {
          bestGain = gain;
          bestQuestion = question;
        }
      });
    });
    return { bestGain, bestQuestion };
  }

  /**
   * Interactively build tree until it reaches the terminal nodes
   * @param {any} X
   * @param {any} y
   * @returns {any}
   */
  private buildTree({ X, y }): DecisionNode | Leaf {
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

  /**
   * Predict a row value according to the fitted tree
   * @param {any} row
   * @param {any} node
   * @returns {any}
   * @private
   */
  private _predict({ row, node }): any[] {
    if (node instanceof Leaf) {
      return node.predictions;
    }

    if (node.question.match(row)) {
      return this._predict({ row, node: node.trueBranch });
    } else {
      return this._predict({ row, node: node.falseBranch });
    }
  }

  /**
   * Private method for printing tree; required for recursion
   * @param {any} node
   * @param {any} spacing
   */
  private _printTree({ node, spacing = '' }): void {
    if (node instanceof Leaf) {
      console.info(spacing + '' + JSON.stringify(node.predictions));
      return;
    }

    // Print the question of the node
    console.info(spacing + node.question.toString());

    // Call this function recursively for true branch
    console.info(spacing, '--> True');
    this._printTree({ node: node.trueBranch, spacing: spacing + ' ' });

    // Call this function recursively for false branch
    console.info(spacing, '--> False');
    this._printTree({ node: node.falseBranch, spacing: spacing + ' ' });
  }
}
