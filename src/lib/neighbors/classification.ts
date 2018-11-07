import { map, uniqBy } from 'lodash';
import { inferShape, validateFitInputs } from '../ops';
import { Type1DMatrix, Type2DMatrix } from '../types';
import math from '../utils/MathExtra';
import KDTree from './KDTree';
const { euclideanDistance, manhattanDistance } = math.contrib;
const DIST_EUC = 'euclidean';
const DIST_MAN = 'manhattan';
const TYPE_KD = 'kdtree';

/**
 * Classifier implementing the k-nearest neighbors vote.
 *
 * @example
 * const knn = new KNeighborsClassifier();
 * const X = [[0, 0, 0], [0, 1, 1], [1, 1, 0], [2, 2, 2], [1, 2, 2], [2, 1, 2]];
 * const y = [0, 0, 0, 1, 1, 1];
 * knn.fit(X ,y);
 * console.log(knn.predict([1, 2])); // predicts 1
 */
export class KNeighborsClassifier {
  private type = null;
  private tree = null;
  private k = null;
  private classes = null;
  private distance = null;

  /**
   * @param {string} distance - Choice of distance function, should choose between euclidean | manhattan
   * @param {number} k - Number of neighbors to classify
   * @param {string} type - Type of algorithm to use, choose between kdtree(default) | balltree | simple
   */
  constructor(
    {
      // Each object param default value
      distance = DIST_EUC,
      k = 0,
      type = TYPE_KD
    }: {
      // Param types
      distance: string;
      k: number;
      type: string;
    } = {
      // Default value on empty constructor
      distance: DIST_EUC,
      k: 0,
      type: TYPE_KD
    }
  ) {
    const options = {
      distance,
      k,
      type
    };
    // Handling distance
    if (options.distance === DIST_EUC) {
      this.distance = euclideanDistance;
    } else if (options.distance === DIST_MAN) {
      this.distance = manhattanDistance;
    } else {
      throw new Error(
        `Unrecognised type of distance ${options.distance} was received`
      );
    }
    this.k = options.k;
    this.type = options.type;
  }

  /**
   * Train the classifier with input and output data
   * @param {any} X - Training data.
   * @param {any} y - Target data.
   */
  public fit(
    X: Type2DMatrix<number | string | boolean>,
    y: Type1DMatrix<number | string | boolean>
  ): void {
    validateFitInputs(X, y);
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
   * Return the model's state as a JSON object
   * @return {object} JSON KNN model.
   */
  public toJSON(): {
    classes: any[];
    distance: any;
    k: number;
    tree: any;
    type: string;
  } {
    return {
      classes: this.classes,
      distance: this.distance,
      k: this.k,
      tree: this.tree,
      type: this.type
    };
  }

  /**
   * Restores the model from a JSON checkpoint
   * @param {any} classes
   * @param {any} distance
   * @param {any} k
   * @param {any} tree
   * @param {any} type
   */
  public fromJSON({
    classes = null,
    distance = null,
    k = null,
    tree = null,
    type = null
  }): void {
    if (!classes || !distance || !k || !tree || !type) {
      throw new Error(
        'You must provide classes, distance, k, tree and type to restore the KNearestNeighbor'
      );
    }
    this.classes = classes;
    this.distance = distance;
    this.k = k;
    this.tree = tree;
    this.type = type;
  }

  /**
   * Predict single value from a list of data
   * @param {Array} X - Prediction data.
   * @returns number
   */
  public predict(
    X:
      | Type2DMatrix<number | string | boolean>
      | Type1DMatrix<number | string | boolean>
  ): any {
    const shape = inferShape(X);
    if (shape.length === 1) {
      return this.getSinglePred(X);
    } else if (shape.length === 2) {
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
