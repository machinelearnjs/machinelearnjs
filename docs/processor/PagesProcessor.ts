import * as fs from 'fs-extra';
import * as path from 'path';
import { BaseProcesser } from './BaseProcesser';

export class PagesProcessor extends BaseProcesser {
  // Pages params
  private pageSrcPath = path.join(__dirname, '../pages');
  private pageDestPath = path.join(__dirname, '../md_out');

  /**
   * Run the processor
   */
  public run(): void {
    fs.copySync(this.pageSrcPath, this.pageDestPath);
  }
}
