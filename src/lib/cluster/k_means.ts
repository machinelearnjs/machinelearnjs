import * as _ from 'lodash';
import * as Random from 'random-js';
import math from '../utils/MathExtra';

export interface KMeansOptions {
  /**
   * Number of clusters
   */
  k: number;
  /**
   * Choice of distance method. Defaulting to euclidean
   */
  distance?: 'euclidean' | 'manhattan';
  /**
   * Relative tolerance with regards to inertia to declare convergence
   */
  maxIteration?: number;
	/**
   * Random state value for sorting centroids during the getInitialCentroid phase
	 */
	randomState?: number;
}

export class KMeans {
  private k: number;
  private distance;
  private randomState: number;
  private maxIteration: number;
  private centroids: number[];
  private assignment: number[];
  private clusters: number[];

  constructor(
    options: KMeansOptions = {
      k: 3,
      distance: 'euclidean',
      maxIteration: 300
    }
  ) {
    this.k = _.get(options, 'k', 3);
    // Assigning a distance method
    const distanceType = _.get(options, 'distance', 'euclidean');
    switch (distanceType) {
      case 'euclidean':
        this.distance = math.contrib.euclideanDistance;
        break;
      case 'manhattan':
        this.distance = math.contrib.manhattanDistance;
        break;
      default:
        throw new Error(`Unknown distance type ${distanceType}`);
    }
    this.randomState = _.get(options, 'randomState', 0);
    this.maxIteration = _.get(options, 'maxIteration', 300);
    this.centroids = [];
  }

	/**
   * Get initial centroids from X of k
	 * @param {number[]} X
	 * @param {number} k
	 * @returns {number[]}
	 */
  private getInitialCentroids(X: number[], k: number) {
    // Create an initial copy
    let centroids = _.clone(X);
    // Sort the centroid randomly if the randomState is greater than 0
    if (this.randomState > 0) {
      const randomEngine = Random.engines.mt19937();
      randomEngine.seed(this.randomState);
      centroids.sort(() => {
        const randomInt = Random.integer(0, 1)(randomEngine);
        return Math.round(randomInt) - 0.5;
      });
    }
    return centroids.slice(0, k);
  }

  private getClosestCentroids(data: number[], centroids: number[], distance) {
    let min = Infinity;
    let index = 0;
    _.forEach(centroids, (centroid, i) => {
      const dist = distance(data, centroid);
      if (dist < min) {
        min = dist;
        index = i;
      }
    });
    return index;
  }

	/**
   *
	 * @param {any} X
	 * @returns {{centroids: number[]; clusters: number[]}}
	 */
  public fit({ X }) {
    this.assignment = new Array(_.size(X));
    this.centroids = this.getInitialCentroids(X, this.k);
    this.clusters = new Array(this.k);
    console.warn(this.maxIteration);

    // Flag to check the convergence
    let movement = true;
    // Looping only within the maxIteration boundary
    for (let iter = 0; iter < this.maxIteration && movement; iter++) {
      // find the distance between the point and cluster; choose the nearest centroid
      _.forEach(X, (data, i) => {
        this.assignment[i] = this.getClosestCentroids(data, this.centroids, this.distance);
      });

      // Flag set to false; giving opportunity to stop the loop upon the covergence
      movement = false;

      // Updating the location of each centroid
      for (let j = 0; j < this.k; j++) {
        let assigned:any = [];
        for (let i = 0; i < this.assignment.length; i++) {
          if (this.assignment[i] == j) {
            assigned.push(X[i]);
          }
        }

        if (!assigned.length) {
          continue;
        }

        // Getting the original data point
        let centroid:any = this.centroids[j];
        let newCentroid:any = new Array(centroid.length);

        for (let g = 0; g < centroid.length; g++) {
          let sum = 0;
          for (let i = 0; i < assigned.length; i++) {
            sum += assigned[i][g];
          }
          newCentroid[g] = sum / assigned.length;

          // Does not converge yet
          if (newCentroid[g] != centroid[g]) {
            movement = true;
          }
        }
        this.centroids[j] = newCentroid;
        this.clusters[j] = assigned;
      }
    }
    return {
      centroids: this.centroids,
      clusters: this.clusters
    };
  }

	/**
   * Predicts the cluster index with the given X
	 * @param {any} X
	 * @returns {number[]}
	 */
  public predict({ X }) {
    return _.map(X, (data) => {
      return this.getClosestCentroids(data, this.centroids, this.distance);
    });
  }
}
