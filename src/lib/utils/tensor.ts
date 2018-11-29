import { flattenDeep } from 'lodash';
import { TypeMatrix } from '../types/matrix.types';

/**
 * Reshapes any size of array into a new shape. The code was copied from
 * math.js, https://github.com/josdejong/mathjs/blob/5750a1845442946d236822505c607a522be23474/src/utils/array.js#L258
 * in order to use specific method from Math.js instead of install an entire library.
 *
 * @example
 * reshape([1, 2, 3, 4, 5, 6], [2, 3]); // [[1, 2, 3], [4, 5, 6]]
 *
 * @param array - Target array
 * @param sizes - New array shape to resize into
 * @ignore
 */
export function reshape(array, sizes): TypeMatrix<any> {
  // If the reshaping is to single dimensional
  if (Array.isArray(array) && sizes.length === 1) {
    const deepFlat = flattenDeep(array);
    if (deepFlat.length === sizes[0]) {
      return deepFlat;
    } else {
      throw new TypeError(
        `Target array shape [${
          deepFlat.length
        }] cannot be reshaped into ${sizes}`
      );
    }
  }

  // testing if there are enough elements for the requested shape
  let tmpArray = array;
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
