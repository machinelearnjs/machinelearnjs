/* tslint:disable */
import { KMeans } from './k_means';

const kmean = new KMeans({ k: 2 });
const clusters = kmean.fit({X: [[1, 2], [1, 4], [1, 0], [4, 2], [4, 4], [4, 0]]});
console.log('checking clusters', clusters);

kmean.predict({ X: [[0, 0], [4, 4]] });

// Create the data 2D-array (vectors) describing the data