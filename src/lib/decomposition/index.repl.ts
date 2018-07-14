/* tslint:disable */
import { PCA } from './pca';

const pca = new PCA();
const X = [[1, 2], [3, 4], [5, 6]];
pca.fit({ X });

console.log('components', pca.components);
console.log('explained var', pca.explained_variance);
