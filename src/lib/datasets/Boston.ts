/**
 * References:
 * - https://www.kaggle.com/c/boston-housing/data
 * - https://www.cs.toronto.edu/~delve/data/boston/bostonDetail.html
 */

import { BaseDataset } from './BaseDataset';

/**
 * This dataset contains information collected by the U.S Census Service concerning housing in the area of Boston Mass.
 * It was obtained from the StatLib archive (http://lib.stat.cmu.edu/datasets/boston),
 * and has been used extensively throughout the literature to benchmark algorithms.
 * However, these comparisons were primarily done outside of Delve and are thus somewhat suspect.
 * The dataset is small in size with only 506 cases.
 *
 * The data was originally published by Harrison, D. and Rubinfeld, D.L.
 * `Hedonic prices and the demand for clean air', J. Environ. Economics & Management, vol.5, 81-102, 1978.
 *
 * @example
 * import { Boston } from "machinelearn/datasets";
 *
 * (async function() {
 *   const bostonData = new Boston();
 *   const {
 *     data,
 *     targets,
 *     labels,
 *   } = await bostonData.load();
 * });
 *
 */
export class Boston extends BaseDataset {
  /**
   * Load the dataset
   */
  public async load(): Promise<{
    /**
     * Training data
     */
    data: any[][];
    /**
     * Target data
     */
    targets: any[];
    /**
     * Real labels
     */
    labels: string[];
  }> {
    const { data, targets, labels } = await this.fsLoad('boston');
    // console.info('checking data', data[0]);
    return {
      data,
      targets,
      labels,
    };
  }
}
