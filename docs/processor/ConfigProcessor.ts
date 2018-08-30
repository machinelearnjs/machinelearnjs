import * as fs from 'fs-extra';
import { isEmpty } from 'lodash';
import * as path from 'path';
import { BaseProcesser } from './BaseProcesser';

export class ConfigProcessor extends BaseProcesser {
  private srcConfigPath = path.join(__dirname, '../config.js');
  private destConfigPath = path.join(__dirname, '../md_out/.vuepress/config.js');
  private srcPublicPath = path.join(__dirname, '../public');
  private destPublicPath = path.join(__dirname, '../md_out/.vuepress/public');
  private srcOverrideStylePath = path.join(__dirname, '../override.styl');
  private destOverrideStylePath = path.join(__dirname, '../md_out/.vuepress/override.styl');

  /**
   * Runs the processor
   * @param {any} apiChildren
   */
  public run({ apiChildren }): void {
    if (isEmpty(apiChildren)) {
      throw Error('Cannot execute the processor because apiChildren is empty');
    }
    this.createDir();
    // 1. config
    fs.createReadStream(this.srcConfigPath).pipe(fs.createWriteStream(this.destConfigPath));

    // 2. public
    fs.copySync(this.srcPublicPath, this.destPublicPath);

    // 3. Style
    fs.createReadStream(this.srcOverrideStylePath).pipe(fs.createWriteStream(this.destOverrideStylePath));
  }

  /**
   * Create dir if not exist, it can be abstracted to a Utils file
   */
  private createDir(): void {
    // Create public dir if it doesn't exist
    if (!fs.existsSync(this.destPublicPath)) {
      fs.mkdirSync(this.destPublicPath);
    }
  }
}
