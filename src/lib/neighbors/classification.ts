import { map, uniqBy } from 'lodash';
import math from '../utils/MathExtra';
import KDTree from './KDTree';
const { isMatrixOf, isArrayOf } = math.contrib;

/**
 * Classifier implementing the k-nearest neighbors vote.
 */
export class KNeighborsClassifier {
  private type = null;
  private tree = null;
  private k = null;
  private classes = null;
  private distance = null;

  /**
   * @param {object} options
   * @param {number} [options.k=numberOfClasses + 1] - Number of neighbors to classify.
   * @param {function} [options.distance=euclideanDistance] - Distance function that takes two parameters.
   * @param {string} [options.type='kdtree'] - type of KNN algorithm to use. Choose between 'kdtree' (default), 'simple', 'balltree'
   */
  constructor(options: { distance: any; k: number; type: string } = { distance: null, k: 0, type: 'kdtree' }) {
    this.distance = options.distance;
    this.k = options.k;
    this.type = options.type;
  }

  /**
   * Train the classifier with input and output data
   * @param {any} X
   * @param {any} y
   */
  public fit({ X, y }): void {
    // Getting the classes from y
    const classes = uniqBy(y, c => c);

    // Doing a unary operation since _.get will only use the default value
    // if the original value is undefined. However, options.distance is not undefined
    // Reference: https://lodash.com/docs/4.17.10#get
    const distance = this.distance ? this.distance : math.contrib.euclideanDistance;

    // Setting k; if it's null, use the class length
    const k = this.k ? this.k : classes.length + 1;

    const points = new Array(X.length);
    for (let i = 0; i < points.length; ++i) {
      points[i] = X[i].slice();
    }

    for (let i = 0; i < y.length; ++i) {
      points[i].push(y[i]);
    }

    // Finally assigning the prepared values to the class itself
    if (this.type === 'kdtree') {
      this.tree = new KDTree(points, distance);
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
