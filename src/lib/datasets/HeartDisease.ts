import { BaseDataset } from './BaseDataset';

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
