import { Type2DMatrix } from './matrix.types';

/**
 * Base typing for ModelState. The typing ensures that model state can only have string, number, number[], string[]
 * or ModelState itself for recursive object typing
 */
export interface TypeModelState {
  [key: string]:
    | number
    | string
    | TypeModelState
    | ReadonlyArray<string>
    | ReadonlyArray<number>;
}

/**
 * Base type definition for all the models
 */
export abstract class IMlModel<T> {
  /**
   * Fit data to build model
   */
  public abstract fit(X: Type2DMatrix, y: ReadonlyArray<T>): void;

  /**
   * Predict multiple rows. Each row has a feature data for a prediction
   */
  public abstract predict(X: Type2DMatrix): ReadonlyArray<T>;

  /**
   * Restores model from a checkpoint
   */
  public abstract fromJSON(state: TypeModelState): void;
  /**
   * Returns a model checkpoint
   */
  public abstract toJSON(): TypeModelState;
}
