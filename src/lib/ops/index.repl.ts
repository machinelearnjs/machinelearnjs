/* tslint:disable */
import * as tf from '@tensorflow/tfjs';
import { inferShape } from './tensor_ops';

const result = inferShape([[1, 2]]);

console.log(result);

import { svd } from './linalg_ops';

const X = tf.tensor2d([[1, 2], [3, 4], [5, 6]]);
console.log(svd(X));
