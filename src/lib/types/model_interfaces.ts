/**
 * Typing for a matrix
 *
 * @example
 * [[1, 2], [3, 4]]
 */
export type TypeMatrix<T> = ReadonlyArray<ReadonlyArray<T>> | number[][];

/**
 * Typing for a vector
 *
 * @example
 * [1, 2, 3]
 */
export type TypeVector<T> = ReadonlyArray<T> | number[];
