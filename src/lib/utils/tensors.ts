import * as tf from '@tensorflow/tfjs';
import * as _ from 'lodash';
import { TypeMatrix } from '../types';

/**
 * Infers shape of a tensor using TF
 *
 * @example
 * inferShape(1) // exception
 * inferShape(true) // exception
 * inferShape([1, 2]) // [2]
 * inferShape([[1, 2], [3, 4]]) // [2, 2]
 *
 * @param X
 * @ignore
 */
export function inferShape(X: TypeMatrix<any>): number[] {
  return tf.tensor(X).shape;
}

/**
 * Reshapes any size of array into a new shape.
 *
 * The code was borrowed from math.js (https://github.com/josdejong/mathjs/blob/5750a1845442946d236822505c607a522be23474/src/utils/array.js#L258),
 * which enables us to use a specific method from Math.js instead of installing an entire library.
 *
 * TF.js has implemented an efficient way to return raw values from its Tensor implementation that always returns a 1D array,
 * which is not ideal in situations where we need a return value with correct shapes.
 *
 * Please check out https://github.com/tensorflow/tfjs/issues/939 for more information
 *
 * @example
 * reshape([1, 2, 3, 4, 5, 6], [2, 3]); // [[1, 2, 3], [4, 5, 6]]
 * reshape([1, 2, 3, 4, 5, 6], [2, 3, 1]); // [[[1], [2], [3]], [[4], [5], [6]]]
 *
 * @param array - Target array
 * @param sizes - New array shape to resize into
 * @ignore
 */
export function reshape<T>(
  array: TypeMatrix<T>,
  sizes: number[]
): TypeMatrix<T> {
  // Initial validations
  if (!Array.isArray(array)) {
    throw new TypeError('The input array must be an array!');
  }

  if (!Array.isArray(sizes)) {
    throw new TypeError('The sizes must be an array!');
  }

  const deepFlatArray = _.flattenDeep<T>(array);
  // If the reshaping is to single dimensional
  if (sizes.length === 1 && deepFlatArray.length === sizes[0]) {
    return deepFlatArray;
  } else if (sizes.length === 1 && deepFlatArray.length !== sizes[0]) {
    throw new TypeError(
      `Target array shape [${
        deepFlatArray.length
      }] cannot be reshaped into ${sizes}`
    );
  }

  // testing if there are enough elements for the requested shape
  let tmpArray = deepFlatArray;
  let tmpArray2;
  // for each dimensions starting by the last one and ignoring the first one
  for (let sizeIndex = sizes.length - 1; sizeIndex > 0; sizeIndex--) {
    const size = sizes[sizeIndex];

    tmpArray2 = [];

    // aggregate the elements of the current tmpArray in elements of the requested size
    const length = tmpArray.length / size;
    for (let i = 0; i < length; i++) {
      tmpArray2.push(tmpArray.slice(i * size, (i + 1) * size));
    }
    // set it as the new tmpArray for the next loop turn or for return
    tmpArray = tmpArray2;
  }

  return tmpArray;
}
