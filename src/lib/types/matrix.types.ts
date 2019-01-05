/**
 * Matrix Type covers up to 4D array
 */
export type TypeMatrix<T> =
  | T[]
  | T[][]
  | T[][]
  | T[][][]
  | T[][][][]
  | T[][][][][]
  | T[][][][][][];

/**
 * Typing for a 1D matrix
 */
export type Type1DMatrix<T> = T[];

/**
 * Typing for a 2D matrix
 */
export type Type2DMatrix<T> = T[][];

/**
 * Typing for a 3D matrix
 */
export type Type3DMatrix<T> = T[][][];

/**
 * Typeing for a 4D matrix
 */
export type Type4DMatrix<T> = T[][][][];
