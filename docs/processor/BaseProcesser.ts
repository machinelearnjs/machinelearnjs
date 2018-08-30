import * as fs from 'fs';
import * as path from 'path';

/**
 * BaseProcessor implemented by the children processors
 */
export class BaseProcesser {
  private vuepressConfigPath = path.join(__dirname, '../md_out/.vuepress');
  private baseOutputDir = path.join(__dirname, '../md_out');
  constructor() {
    this.makeBaseDir();
  }
  protected makeBaseDir(): void {
    if (!fs.existsSync(this.baseOutputDir)) {
      fs.mkdirSync(this.baseOutputDir);
    }
    if (!fs.existsSync(this.vuepressConfigPath)) {
      fs.mkdirSync(this.vuepressConfigPath);
    }
  }
}
