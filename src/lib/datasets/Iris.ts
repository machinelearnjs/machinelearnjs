/**
 * References:
 * - https://archive.ics.uci.edu/ml/datasets/iris
 * - https://en.wikipedia.org/wiki/Iris_flower_data_set
 */
import * as fs from 'fs';
import 'isomorphic-fetch';
import * as path from 'path';
import { BaseDataset } from './BaseDataset';

/**
 * The Iris flower data set or Fisher's Iris data set is a multivariate data set introduced by the British statistician and biologist Ronald Fisher
 * in his 1936 paper The use of multiple measurements in taxonomic problems as an example of linear discriminant analysis.
 *
 * It contains 50 samples with 3 classes of 'Setosa', 'versicolor' and 'virginica'
 *
 * @example
 * import { Iris } from 'machinelearn/datasets';
 *
 * (async function() {
 *   const irisData = new Iris();
 *   const {
 *     data,         // returns the iris data (X)
 *     targets,      // list of target values (y)
 *     labels,       // list of labels
 *     targetNames,  // list of short target labels
 *     description   // dataset description
 *   } = await irisData.load(); // loads the data internally
 * })();
 *
 */
export class Iris extends BaseDataset {
  /**
   * Load datasets
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
    /**
     * Short labels
     */
    targetNames: string[];
    /**
     * Dataset description
     */
    description: string;
  }> {
    // const { data, targets, labels } = await this.fetchLoad(this.dataSources);
    const { data, targets, labels } = await this.fsLoad('iris');
    // prettier-ignore
    const targetNames = ['setosa', 'versicolor', 'virginica'];

    // prettier-ignore
    const description = await fs.readFileSync(path.join(__dirname, './data/iris/iris.names'), 'utf8');
    return {
      data,
      targets,
      labels,
      targetNames,
      description
    };
  }
}
