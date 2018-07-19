/* tslint:disable */
import { KNeighbors } from './classification';

const knn = new KNeighbors();
const X = [[0, 0, 0], [0, 1, 1], [1, 1, 0], [2, 2, 2], [1, 2, 2], [2, 1, 2]];
const y = [0, 0, 0, 1, 1, 1];
knn.fit({ X, y });
console.log('predict', knn.predict([1, 2]));
