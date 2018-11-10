import { map, range, uniqBy } from 'lodash';
import * as Random from 'random-js';
import { validateFitInputs, validateMatrix2D } from '../ops';
import { IMlModel, Type1DMatrix, Type2DMatrix } from '../types';

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
    if (typeof val === 'number') {
      return val >= this.value;
    } else {
      return val === this.value;
    }
  }

  public toString(): string {
    if (!this.features) {
      throw Error(
        'You must provide feature labels in order to render toString!'
      );
    }
    const condition = typeof this.value === 'number' ? '>=' : '==';
    return `Is ${this.features[this.column]} ${condition} ${this.value}`;
  }
}

/**
 * According to the given targets array, count occurrences into an object.
 * @param {any[]} targets - list of class: count
 * @returns {}
 * @ignore
 */
export function classCounts(targets: any[]): {} {
  const result = {};
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    const count = result[target]; // the current
    if (typeof count === 'number' && count > 0) {
      result[target] = {
        value: target,
        count: count + 1
      };
    } else {
      result[target] = {
        value: target,
        count: 1
      };
    }
  }
  return result;
}

/**
 * A leaf node that classifies data.
 * @ignore
 */
export class Leaf {
  public prediction = null;

  constructor(y) {
    const counts = classCounts(y);
    const keys = Object.keys(counts); // Retrieving the keys for looping

    // Variable holders
    let maxCount = 0;
    let maxValue = null;

    // Finding the max count key(actual prediction value)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const count = counts[key].count;
      const value = counts[key].value;
      if (count > maxCount) {
        maxValue = value;
        maxCount = count;
      }
    }
    this.prediction = maxValue;
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

export interface Options {
  featureLabels?: null | any[];
  verbose?: boolean;
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
 * decision.predict({ X: [['Green', 3]] }); // [ 'Apple' ]
 * decision.predict({ X }); // [ [ 'Apple' ], [ 'Apple', 'Lemon' ], [ 'Grape', 'Grape' ], [ 'Grape', 'Grape' ], [ 'Apple', 'Lemon' ] ]
 *
 * @example
 * import { DecisionTreeClassifier } from 'kalimdor/tree';
 * const decision = new DecisionTreeClassifier({ featureLabels: null });
 *
 * const X = [[0, 0], [1, 1]];
 * const Y = [0, 1];
 * decision.fit({ X, y });
 * decision2.predict({ row: [[2, 2]] }); // [ 1 ]
 */
export class DecisionTreeClassifier
  implements IMlModel<string | boolean | number> {
  private featureLabels = null;
  private tree = null;
  private verbose = true;
  private randomState = null;
  private randomEngine = null;

  /**
   *
   * @param featureLabels - Literal names for each feature to be used while printing the tree out as a string
   * @param verbose - Logs the progress of the tree construction as console.info
   * @param random_state - A seed value for the random engine
   */
  constructor(
    {
      featureLabels = null,
      verbose = false,
      random_state = null
    }: {
      featureLabels?: any[];
      verbose?: boolean;
      random_state?: number;
    } = {
      featureLabels: null,
      verbose: false,
      random_state: null
    }
  ) {
    this.featureLabels = featureLabels;
    this.verbose = verbose;
    this.randomState = random_state;
    if (!Number.isInteger(random_state)) {
      this.randomEngine = Random.engines.mt19937().autoSeed();
    } else {
      this.randomEngine = Random.engines.mt19937().seed(random_state);
    }
  }

  /**
   * Fit date, which builds a tree
   * @param {any} X - 2D Matrix of training
   * @param {any} y - 1D Vector of target
   * @returns {Leaf | DecisionNode}
   */
  public fit(
    X: Type2DMatrix<string | number | boolean> = null,
    y: Type1DMatrix<string | number | boolean> = null
  ): void {
    validateFitInputs(X, y);
    this.tree = this.buildTree({ X, y });
  }

  /**
   * Predict multiple rows
   *
   * @param X - 2D Matrix of testing data
   */
  public predict(X: Type2DMatrix<string | boolean | number> = []): any[] {
    validateMatrix2D(X);
    const result = [];
    for (let i = 0; i < X.length; i++) {
      const row = X[i];
      result.push(this._predict({ row, node: this.tree }));
    }
    return result;
  }

  /**
   * Returns the model checkpoint
   * @returns {{featureLabels: string[]; tree: any; verbose: boolean}}
   */
  public toJSON(): {
    /**
     * Literal names for each feature to be used while printing the tree out as a string
     */
    featureLabels: string[];
    /**
     * The model's state
     */
    tree: any; // TODO: fix this type
    /**
     * Logs the progress of the tree construction as console.info
     */
    verbose: boolean;
    /**
     * A seed value for the random engine
     */
    random_state: number;
  } {
    return {
      featureLabels: this.featureLabels,
      tree: this.tree,
      verbose: this.verbose,
      random_state: this.randomState
    };
  }

  /**
   * Restores the model from a checkpoint
   * @param {string[]} featureLabels - Literal names for each feature to be used while printing the tree out as a string
   * @param {any} tree - The model's state
   * @param {boolean} verbose - Logs the progress of the tree construction as console.info
   * @param {number} random_state - A seed value for the random engine
   */
  public fromJSON({
    featureLabels = null,
    tree = null,
    verbose = false,
    random_state = null
  }: {
    featureLabels: string[];
    tree: any;
    verbose: boolean;
    random_state: number;
  }): void {
    this.featureLabels = featureLabels;
    this.tree = tree;
    this.verbose = verbose;
    this.randomState = random_state;
  }

  /**
   * Recursively print the tree into console
   * @param {string} spacing - Spacing used when printing the tree into the terminal
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
    for (let i = 0; i < X.length; i++) {
      const row = X[i];
      if (question.match(row)) {
        trueX.push(X[i]);
        trueY.push(y[i]);
      } else {
        falseX.push(X[i]);
        falseY.push(y[i]);
      }
    }

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
    const keys = Object.keys(counts);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const count = counts[key].count;
      if (count === null || count === undefined) {
        throw Error('Invalid class count detected!');
      }

      const probOfClass = count / targets.length;
      impurity -= Math.pow(probOfClass, 2);
    }
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
    const p = left.length / (left.length + right.length);
    return uncertainty - p * this.gini(left) - (1 - p) * this.gini(right);
  }

  /**
   * Find the best split for the current X and y.
   * @param X
   * @param y
   * @returns {{bestGain: number; bestQuestion: any}}
   */
  private findBestSplit(X, y): { bestGain: number; bestQuestion: Question } {
    const uncertainty = this.gini(y);
    const nFeatures = X[0].length;
    let bestGain = 0;
    let bestQuestion = null;

    let featureIndex = [];
    if (Number.isInteger(this.randomState)) {
      // method 1: Randomly selecting features
      while (featureIndex.length <= nFeatures) {
        const index = Random.integer(0, nFeatures)(this.randomEngine);
        featureIndex.push(index);
      }
    } else {
      featureIndex = range(0, X[0].length);
    }

    for (let i = 0; i < featureIndex.length; i++) {
      const col = featureIndex[i];
      const uniqFeatureValues = uniqBy(map(X, row => row[col]), x => x);
      for (let j = 0; j < uniqFeatureValues.length; j++) {
        const feature = uniqFeatureValues[j];
        // featureLabels is for the model interoperability
        const question = new Question(this.featureLabels, col, feature);

        // Try splitting the dataset
        const { trueY, falseY } = this.partition(X, y, question);

        // Skip this dataset if it does not divide
        if (trueY.length === 0 || falseY.length === 0) {
          continue;
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
      }
    }
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
   * Internal predict method separated out for recursion purpose
   * @param {any} row
   * @param {any} node
   * @returns {any}
   * @private
   */
  private _predict({ row, node }): any[] {
    if (node instanceof Leaf) {
      // Just return the highest voted
      return node.prediction;
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
      console.info(spacing + '' + node.prediction);
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
