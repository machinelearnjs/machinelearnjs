import * as _ from 'lodash';
import * as kmeans from 'node-kmeans';

interface KMeansOptions {
	/**
   * Number of clusters
	 */
	k: number,
	/**
   * Choice of distance method. Defaulting to euclidean
	 */
	distance: 'euclidean' | 'manhattan',
}

export class KMeans {
  private k: number;
  private distance: string;
  constructor(opions: KMeansOptions = {
    k = 3,
    distance = 'euclidean'
  }) {
    this.k = _.get(opions, 'k', 3);
    this.distance = _.get(options, 'distance', 'euclidean');
  }

  private getInitialCentroids(X: number[], k: number) {
    const centroidsRange = _.range(0, k);
    return _.reduce(centroidsRange, (centroids, i) => {
      return _.concat(centroids, X[i]);
    }, []);
  }

  public fit(X) {

  }
}

// Data source: LinkedIn
/*
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