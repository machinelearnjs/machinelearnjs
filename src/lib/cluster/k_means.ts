import * as _ from 'lodash';
import math from '../utils/MathExtra';

export interface KMeansOptions {
	/**
   * Number of clusters
	 */
	k: number;
	/**
   * Choice of distance method. Defaulting to euclidean
	 */
	distance: 'euclidean' | 'manhattan';
	/**
   * Relative tolerance with regards to inertia to declare convergence
	 */
	maxIteration: number;
}

export class KMeans {
  private k: number;
  private distance;
  private maxIteration: number;
  private centroids: number[];

  constructor(options: KMeansOptions = {
    k: 3,
    distance: 'euclidean',
    maxIteration: 300
  }) {
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

    this.maxIteration = _.get(options, 'maxIteration', 300);
    this.centroids = [];
  }

  private getInitialCentroids(X: number[], k: number) {
    // Create an initial copy
    let centroids = _.clone(X)
    // Sort it randomly
    // TODO: Random seed
    centroids.sort(() => {
      return (Math.round(Math.random()) - 0.5);
    });
    return centroids.slice(0, k);
  }

  private getClosestCentroids(data: number[], centroids: number[], distance) {
    let min = Infinity;
    let index = 0;
    _.forEach(centroids, (centroid, i) => {
      console.log('checking data', data, ' centroid ', centroid);
      const dist = distance(data, centroid);
      console.log('checking dist', dist);
      if (dist < min) {
        min = dist;
        index = i;
      }
    });
    return index;
  }

  public fit(X) {
    this.centroids = this.getInitialCentroids(X, this.k);
    console.warn(this.maxIteration);
    // Looping only within the maxIteration boundary
    for (let iter = 0; iter < 1; iter++) {

      // find the distance between the point and cluster; choose the nearest centroid
      const assignments = _.map(X, (data) => {
        return this.getClosestCentroids(data, this.centroids, this.distance);
      });
      console.log('checking assignments', assignments);
    }
  }
}

// Data source: LinkedIn
/*
import * as kmeans from 'node-kmeans';

const data = [
  { company: 'Microsoft', size: 91259, revenue: 60420 },
  { company: 'IBM', size: 400000, revenue: 98787 },
  { company: 'Skype', size: 700, revenue: 716 },
  { company: 'SAP', size: 48000, revenue: 11567 },
  { company: 'Yahoo!', size: 14000, revenue: 6426 },
  { company: 'eBay', size: 15000, revenue: 8700 }
];

// Create the data 2D-array (vectors) describing the data
const vectors = [];
for (let i = 0; i < data.length; i++) {
  vectors[i] = [_.get(data, `[${i}].size`), _.get(data, `[${i}].revenue`)];
}

kmeans.clusterize(vectors, { k: 4 }, err => {
  if (err) {
    console.error(err);
  } else {
    // silence is golden
  }
});
*/