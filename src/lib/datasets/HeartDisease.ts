import { BaseDataset } from './BaseDataset';

/**
 * This database contains 76 attributes, but all published experiments refer to using a subset of 14 of them.
 * In particular, the Cleveland database is the only one that has been used by ML researchers to this date.
 * The "goal" field refers to the presence of heart disease in the patient. It is integer valued from 0 (no presence) to 4.
 * Experiments with the Cleveland database have concentrated on simply attempting to distinguish presence (values 1,2,3,4) from absence (value 0).
 *
 * @example
 * import { HeartDisease } from "machinelearn/datasets";
 *
 * (async function() {
 *   const heartDiseaseDataset = new HeartDisease();
 *   const {
 *     data,
 *     targets,
 *     labels,
 *   } = await heartDiseaseDataset.load();
 * });
 */
export class HeartDisease extends BaseDataset {
  public async load(): Promise<{
    data: any[][];
    targets: any[];
    labels: string[];
  }> {
    const { data, targets, labels } = await this.fsLoad('heart_disease');

    return {
      data,
      targets,
      labels,
    };
  }
}
