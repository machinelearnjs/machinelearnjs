import * as fs from 'fs';
import * as _ from 'lodash';
import * as path from 'path';
import { BaseProcesser } from './BaseProcesser';

export class PagesProcessor extends BaseProcesser {
  // Readme Params
  private defaultREADME = true; // To use the default readme as homepage
  private srcReadMePath = path.join(__dirname, '../../README.md');
  private destReadMePath = path.join(__dirname, '../md_out/README.md');

  // Pages params
  private pageSrcPath = path.join(__dirname, '../pages');
  private pageDestPath = path.join(__dirname, '../md_out');

  constructor({ defaultREADME = true }) {
    super();
    this.defaultREADME = defaultREADME;
  }

  /**
   * Run the processor
   */
  public run(): void {
    if (this.defaultREADME) {
      // 1. homepage using the project readme
      this.processHomePage();
    }

    // 2. all the other pages under docs/pages/
    this.syncOtherPages();
  }

  /**
   * Process and sync the homepage as md_out/README.md
   */
  private processHomePage(): void {
    fs.createReadStream(this.srcReadMePath).pipe(fs.createWriteStream(this.destReadMePath));
  }

  /**
   * Sync any md files located under docs/pages folder to the root of md_out
   */
  private syncOtherPages(): void {
    _.forEach(fs.readdirSync(this.pageSrcPath), file => {
      const fullSrcFilePath = path.join(this.pageSrcPath, file);
      const fullDestFilePath = path.join(this.pageDestPath, file);
      fs.createReadStream(fullSrcFilePath).pipe(fs.createWriteStream(fullDestFilePath));
    });
  }
}
