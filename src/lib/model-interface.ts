type Type2DMatrix = ReadonlyArray<ReadonlyArray<number>>

export abstract class IFitPredict<T> {
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
  public abstract fromJSON(json: any): void;
  /**
   * Returns a model checkpoint
   */
  public abstract toJSON(): any;
}
