/**
 * @ignore
 */
export class BaseDataset {
  /**
   * List of target names/labels. `.targets` contain a list index of targetNames
   * @type {any[]}
   */
  protected targetNames: any[] = null;
  /**
   * List of actual data, X values
   * @type {any[][]}
   */
  protected data: any[] = null;
  /**
   * List of targets, y values
   * @type {any[][]}
   */
  protected targets: any[] = null;
  /**
   * Description of the dataset
   * @type {string}
   */
  protected description: string;
}
