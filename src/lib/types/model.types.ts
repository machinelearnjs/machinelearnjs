import {
  Type1DMatrix,
  Type2DMatrix,
  Type3DMatrix,
  Type4DMatrix
} from './matrix.types';

/**
 * Base typing for ModelState. The typing ensures that model state can only have string, number, number[], string[]
 * or ModelState itself for recursive object typing
 */
export interface TypeModelState {
  [key: string]:
    | number
    | string
    | boolean
    | TypeModelState
    | Type1DMatrix<any>
    | Type2DMatrix<any>
    | Type3DMatrix<any>
    | Type4DMatrix<any>;
}

/**
 * Base type definition for all the models
 * @ignore
 */
export abstract class IMlModel<T> {
  /**
   * Fit data to build model
   */
  public abstract fit(X: Type2DMatrix<T>, y?: Type1DMatrix<T>): void;
  /**
   * Predict multiple rows. Each row has a feature data for a prediction
   */
  public abstract predict(X: Type2DMatrix<T>): T[] | T[][];

  /**
   * Restores model from a checkpoint
   */
  public abstract fromJSON(state: TypeModelState): void;
  /**
   * Returns a model checkpoint
   */
  public abstract toJSON(): TypeModelState;
}
