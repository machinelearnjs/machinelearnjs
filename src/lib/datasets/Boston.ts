/**
 * References:
 * - https://www.kaggle.com/c/boston-housing/data
 * - https://www.cs.toronto.edu/~delve/data/boston/bostonDetail.html
 */

import 'isomorphic-fetch';
import { BaseDataset } from './BaseDataset';

export class Boston extends BaseDataset {
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
    }
  }
}
