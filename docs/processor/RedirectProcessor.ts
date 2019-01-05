import * as fs from 'fs-extra';
import * as path from 'path';
import { BaseProcesser } from './BaseProcesser';

export class RedirectProcessor extends BaseProcesser {
  private srcRedirectsPath = path.join(__dirname, '../_redirects');
  private destRedirectsPath = path.join(__dirname, '../md_out/_redirects');

  /**
   * Runs the processor
   */
  public run(): void {
    // 1. redirects
    fs.createReadStream(this.srcRedirectsPath).pipe(
      fs.createWriteStream(this.destRedirectsPath)
    );
  }
}
