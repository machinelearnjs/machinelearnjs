type Type2DMatrix = ReadonlyArray<ReadonlyArray<number>>

export abstract class IFitPredict<T> {
  /**
   * Fit data to build model
   * @param {number[][]} X - training values, inputs feature data
   * @param {T} y - target values, matched outputs
   */
  public abstract fit(X: Type2DMatrix, y: ReadonlyArray<T>): void;

  /**
   * Predict multiple rows. Each row has a feature data for a prediction
   * @param {number[][]} X - values to predict in Matrix format
   * @returns {T[]}
   */
  public abstract predict(X: Type2DMatrix): ReadonlyArray<T>;

  /**
   * Restores model from a checkpoint
   * @param json - model
   */
  public abstract fromJSON(json: any): void;
  /**
   * Returns a model checkpoint
   */
  public abstract toJSON(): any;
}
