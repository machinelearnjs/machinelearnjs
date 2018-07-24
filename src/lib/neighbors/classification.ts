import { map, uniqBy } from 'lodash';
import math from '../utils/MathExtra';
import KDTree from './KDTree';
import { checkArray } from "../utils/validation";
const { euclideanDistance, manhattanDistance, isMatrixOf, isArrayOf } = math.contrib;
const DIST_EUC = 'euclidean';
const DIST_MAN = 'manhattan';
const TYPE_KD = 'kdtree';

export interface KNNClassifierOptions {
  /**
   * Choice of distance function, should choose between euclidean | manhattan
   */
  distance: string;
  /**
   * Number of neighbors to classify
   */
  k: number;
  /**
   * Type of algorithm to use, choose between kdtree(default) | balltree | simple
   */
  type: string;
}

/**
 * Classifier implementing the k-nearest neighbors vote.
 *
 * @example
 * const knn = new KNeighborsClassifier();
 * const X = [[0, 0, 0], [0, 1, 1], [1, 1, 0], [2, 2, 2], [1, 2, 2], [2, 1, 2]];
 * const y = [0, 0, 0, 1, 1, 1];
 * knn.fit({ X, y });
 * console.log(knn.predict([1, 2])); // predicts 1
 */
export class KNeighborsClassifier {
  private type = null;
  private tree = null;
  private k = null;
  private classes = null;
  private distance = null;

  constructor(
    options: KNNClassifierOptions = {
      distance: DIST_EUC,
      k: 0,
      type: TYPE_KD
    }
  ) {
    // Handling distance
    if (options.distance === DIST_EUC) {
      this.distance = euclideanDistance;
    } else if (options.distance === DIST_MAN) {
      this.distance = manhattanDistance;
    } else {
      throw new Error(`Unrecognised type of distance ${options.distance} was received`);
    }
    this.k = options.k;
    this.type = options.type;
  }

  /**
   * Train the classifier with input and output data
   * @param {any} X
   * @param {any} y
   */
  public fit({ X, y }): void {
    const xCheck = checkArray(X);
    if (!xCheck.isArray || !xCheck.multiclass) {
      throw new Error('X must be a multiclass array!');
    }
    const yCheck = checkArray(y);
    if (!yCheck.isArray || yCheck.multiclass) {
      throw new Error('y must be a single dimensional array!');
    }
    // Getting the classes from y
    const classes = uniqBy(y, c => c);

    // Setting k; if it's null, use the class length
    const k = this.k ? this.k : classes.length + 1;

    //  Constructing the points placeholder
    const points = new Array(X.length);
    for (let i = 0; i < points.length; ++i) {
      points[i] = X[i].slice();
    }
    for (let i = 0; i < y.length; ++i) {
      points[i].push(y[i]);
    }

    // Building a tree or algo according to this.type
    if (this.type === TYPE_KD) {
      this.tree = new KDTree(points, this.distance);
    }
    this.k = k;
    this.classes = classes;
  }

  /**
   * Return a JSON representation
   * @return {object} JSON KNN model.
   */
  public toJSON(): {
    classes: any[];
    k: number;
    type: string;
  } {
    return {
      classes: this.classes,
      k: this.k,
      type: this.type
    };
  }

  /**
   * Predict single value from a list of data
   * @param {Array} X
   * @returns number
   */
  public predict(X): any {
    if (isArrayOf(X, 'number')) {
      return this.getSinglePred(X);
    } else if (isMatrixOf(X, 'number')) {
      return map(X, currentItem => this.getSinglePred(currentItem));
    } else {
      throw new TypeError('The dataset is neither an array or a matrix');
    }
  }

  /**
   * Runs a single prediction against an array based on kdTree or balltree or
   * simple algo
   * @param array
   * @returns {{}}
   */
  private getSinglePred(array): any {
    if (this.tree) {
      return this.getTreeBasedPrediction(array);
    } else {
      // Run the simple KNN algorithm
      return 0;
    }
  }

  /**
   * Get the class with the max point
   * @param current
   * @returns {{}}
   * @ignore
   */
  private getTreeBasedPrediction(current): {} {
    const nearestPoints = this.tree.nearest(current, this.k);
    const pointsPerClass = {};
    let predictedClass = -1;
    let maxPoints = -1;
    const lastElement = nearestPoints[0][0].length - 1;

    // Initialising the points placeholder per class
    for (let j = 0; j < this.classes.length; j++) {
      pointsPerClass[this.classes[j]] = 0;
    }

    // Voting the max value
    for (let i = 0; i < nearestPoints.length; ++i) {
      const currentClass = nearestPoints[i][0][lastElement];
      const currentPoints = ++pointsPerClass[currentClass];
      if (currentPoints > maxPoints) {
        predictedClass = currentClass;
        maxPoints = currentPoints;
      }
    }

    return predictedClass;
  }
}
