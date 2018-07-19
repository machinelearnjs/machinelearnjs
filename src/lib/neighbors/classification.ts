import { uniqBy, map } from 'lodash';
import math from '../utils/MathExtra';
import KDTree from './KDTree';
const { isMatrixOf, isArrayOf } = math.contrib;

/**
 * Classifier implementing the k-nearest neighbors vote.
 */
export class KNeighborsClassifier {
  private kdTree = null;
  private k = null;
  private classes = null;
  private isEuclidean = null;
  private distance = null;

  /**
   * @param {object} options
   * @param {number} [options.k=numberOfClasses + 1] - Number of neighbors to classify.
   * @param {function} [options.distance=euclideanDistance] - Distance function that takes two parameters.
   */
  constructor(options: { distance: any; k: number } = { distance: null, k: 0 }) {
    this.distance = options.distance;
    this.k = options.k;
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
    this.kdTree = new KDTree(points, distance);
    this.k = k;
    this.classes = classes;
  }

  /**
   * Return a JSON containing the kd-tree model.
   * @return {object} JSON KNN model.
   */
  public toJSON(): {
    classes: any[];
    distance: string;
    k: number;
    kdTree: KDTree;
    name: string;
  } {
    return {
      classes: this.classes,
      isEuclidean: this.isEuclidean,
      k: this.k,
      kdTree: this.kdTree,
      name: 'KNN'
    };
  }

  /**
   * Predict single value from a list of data
   * @param {Array} X
   * @returns number
   */
  public predict(X): any {
    if (isArrayOf(X, 'number')) {
      return this.getTreeBasedPrediction(X);
    } else if (isMatrixOf(X, 'number')) {
      return map(X, currentItem => this.getTreeBasedPrediction(currentItem));
    } else {
      throw new TypeError('Passed in dataset is not a single dimensional array');
    }
  }

  /**
   * Get the class with the max point
   * @param current
   * @returns {{}}
   * @ignore
   */
  private getTreeBasedPrediction(current): {} {
    const nearestPoints = this.kdTree.nearest(current, this.k);
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
