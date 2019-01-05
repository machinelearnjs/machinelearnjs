import * as fs from 'fs-extra';
import 'isomorphic-fetch';
import { parseInt, uniqBy } from 'lodash';
import * as path from 'path';
import { LabelEncoder } from '../preprocessing/label';

/**
 * @ignore
 */
export class BaseDataset {
  /**
   * fetch load from a multiple
   * @param sources - A list of URLs to fetch the data from
   * @param type - type of data; for example CSV or JSON
   * @param delimiter - specify the data delimiter, which will be used to split the row data
   * @param lastIsTarget - tell the underlying processor that the last index of the dataset is the target data
   * @param trainType - data type to enforce on the training dataset
   * @param targetType - target type to enforce on the target dataset
   * @private
   */
  protected async fetchLoad(
    sources = [],
    {
      // Params
      type = 'csv',
      delimiter = ',',
      lastIsTarget = true,
      trainType = 'float',
      targetType = 'float'
    } = {
      // Default object if nothing is provided
      type: 'csv',
      delimiter: ',',
      lastIsTarget: true,
      trainType: 'float',
      targetType: 'float'
    }
  ): Promise<{ data; targets; labels }> {
    let data = null;
    for (let i = 0; i < sources.length; i++) {
      const url = sources[i];
      // TODO: Create a fetch middleware to cache already requested data
      const response = await fetch(url);
      const status = response.ok;
      const textData = await response.text();
      if (status && textData) {
        data = textData;
        // No need to request data anymore
        break;
      }
    }
    if (type === 'csv') {
      return this.processCSV(
        data,
        delimiter,
        lastIsTarget,
        trainType,
        targetType
      );
    }
    return {
      data: null,
      targets: null,
      labels: null
    };
  }

  /**
   * Load data from the local data folder
   */
  protected async fsLoad(
    type: string,
    {
      delimiter = ',',
      lastIsTarget = true,
      trainType = 'float',
      targetType = 'float'
    } = {
      // Default object if nothing is provided
      delimiter: ',',
      lastIsTarget: true,
      trainType: 'float',
      targetType: 'float'
    }
  ): Promise<{ data; targets; labels }> {
    // Make sure the actual data is located under data/type
    const data = fs.readFileSync(
      path.join(__dirname, `data/${type}/train.csv`),
      'utf8'
    );
    return this.processCSV(
      data,
      delimiter,
      lastIsTarget,
      trainType,
      targetType
    );
  }

  /**
   * Processes CSV type dataset. Returns a training and testing data pair
   * @param data - a raw string data
   * @param delimiter - delimiter to split on
   * @param lastIsTarget - flag to indicate that the last element is the target data
   * @param trainType - training data type to enforce
   * @param targetType - target data type to enforce
   */
  private processCSV(
    data,
    delimiter = ',',
    lastIsTarget = true,
    trainType = 'float',
    targetType = 'float'
  ): { data; targets; labels } {
    // Split the rows by newlines
    const splitRows = data.split(/\r\n|\n|\r/);
    // Trim any excessive spaces
    const trimmedRows = splitRows.map(row => row.trim());
    // Filtering out any empty rows
    const filteredRows = trimmedRows.filter(row => row);
    // Organise training and target data
    let result = filteredRows.map(row => row.split(delimiter));
    if (lastIsTarget) {
      result = result.reduce(
        (sum, curValue) => {
          // Building the target values array
          sum[1].push(curValue.pop());

          // Building the train values array
          sum[0].push(curValue);
          return sum;
        },
        [[], []]
      );
    }

    // Encode the classes
    const rawTest = result[1];
    const encoder = new LabelEncoder();

    // Get the unique labels
    const labelX: string[] = uniqBy(rawTest, x => x);
    encoder.fit(labelX);

    // Encode the test values
    const targets = encoder.transform(rawTest);

    // Enforcing data type
    // 1. training data
    if (trainType === 'number') {
      result[0] = result[0].map(row => row.map(parseInt));
    } else if (trainType === 'float') {
      result[0] = result[0].map(row => row.map(parseFloat));
    }

    // 2. target data
    if (targetType === 'number') {
      result[1] = result[1].map(parseInt);
    } else if (targetType === 'float') {
      result[1] = result[1].map(parseFloat);
    }
    return {
      data: result[0],
      targets,
      labels: result[1]
    };
  }
}
