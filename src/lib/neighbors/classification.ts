import * as _ from 'lodash';
import euclideanDistance from 'ml-distance-euclidean';
import KDTree from './KDTree';

export interface KNCOptions {
  distance: any;
  k: number;
}

export class KNeighborsClassifier {
  private kdTree = null;
  private k = null;
  private classes = null;
  private isEuclidean = null;
  private options: KNCOptions;

  /**
   * @param {Array} dataset
   * @param {Array} labels
   * @param {object} options
   * @param {number} [options.k=numberOfClasses + 1] - Number of neighbors to classify.
   * @param {function} [options.distance=euclideanDistance] - Distance function that takes two parameters.
   */
  constructor(options: KNCOptions = { distance: null, k: 0 }) {
    this.options = options;
  }

  /**
   * Train the classifier with input and output data
   * @param {any} X
   * @param {any} y
   */
  public fit({ X, y }): void {
    if (X === true) {
      const model = y;
      this.kdTree = new KDTree(model.kdTree, this.options);
      this.k = model.k;
      this.classes = new Set(model.classes);
      this.isEuclidean = model.isEuclidean;
      return;
    }

    const classes = new Set(y);

    // Placeholder _dist function, it can be null as a default value
    const _dist = _.get(this.options, 'distance');
    const distance = _dist ? _dist : euclideanDistance;
    // Placeholder _k value, it can be 0
    const _k = _.get(this.options, 'k');
    const k = _k ? _k : classes.size + 1;

    const points = new Array(X.length);
    for (let i = 0; i < points.length; ++i) {
      points[i] = X[i].slice();
    }

    for (let i = 0; i < y.length; ++i) {
      points[i].push(y[i]);
    }

    this.kdTree = new KDTree(points, distance);
    this.k = k;
    this.classes = classes;
    this.isEuclidean = distance === euclideanDistance;
  }

  /**
   * Create a new KNN instance with the given model.
   * @param {object} model
   * @param {function} distance=euclideanDistance - distance function must be provided if the model wasn't trained with euclidean distance.
   * @return {KNN}
   */
  public load(model, distance = euclideanDistance): KNeighborsClassifier {
    if (model.name !== 'KNN') {
      throw new Error('invalid model: ' + model.name);
    }
    if (!model.isEuclidean && distance === euclideanDistance) {
      throw new Error(
        'a custom distance function was used to create the model. Please provide it again'
      );
    }
    if (model.isEuclidean && distance !== euclideanDistance) {
      throw new Error(
        'the model was created with the default distance function. Do not load it with another one'
      );
    }
    return new KNeighborsClassifier(this.options);
  }

  /**
   * Return a JSON containing the kd-tree model.
   * @return {object} JSON KNN model.
   */
  public toJSON(): {
    classes: any[];
    isEuclidean: boolean;
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
	 * @param {Array} dataset
	 * @returns number
	 */
  public predictOne(dataset) {
    if (Array.isArray(dataset) && typeof dataset[0] === 'number') {
      return getSinglePrediction(this, dataset);
    } else {
      throw new TypeError('Passed in dataset is not an array');
    }
  }

  /**
   * Predicts the output given the matrix to predict.
   * @param {Array} dataset
   * @return {Array} predictions
   */
  public predict(dataset): {} {
    if (Array.isArray(dataset)) {
      if (
        Array.isArray(dataset[0]) &&
        typeof dataset[0][0] === 'number'
      ) {
        const predictions = new Array(dataset.length);
        for (let i = 0; i < dataset.length; i++) {
          predictions[i] = getSinglePrediction(this, dataset[i]);
        }
        return predictions;
      }
    }
    throw new TypeError('dataset to predict must be an array or a matrix');
  }
}

function getSinglePrediction(knn, currentCase): {} {
  const nearestPoints = knn.kdTree.nearest(currentCase, knn.k);
  const pointsPerClass = {};
  let predictedClass = -1;
  let maxPoints = -1;
  const lastElement = nearestPoints[0][0].length - 1;

  for (const element of knn.classes) {
    pointsPerClass[element] = 0;
  }
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
