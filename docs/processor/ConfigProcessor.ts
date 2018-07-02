import * as path from 'path';
import * as fs from 'fs';
import * as _ from 'lodash';
import { BaseProcesser } from './BaseProcesser';

export class ConfigProcessor extends BaseProcesser {
  private vuepressConfigPath = path.join(__dirname, '../md_out/.vuepress');
  private vuepressExtraConfigPath = path.join(__dirname, '../md_out/.vuepress/extra.json');
  private srcConfigPath = path.join(__dirname, '../config.js');
  private destConfigPath = path.join(__dirname, '../md_out/.vuepress/config.js');

  private createDir() {
    // Creating the source out directory if not exists
    if (!fs.existsSync(this.vuepressConfigPath)) {
      fs.mkdirSync(this.vuepressConfigPath);
    }
  }

  public run({ apiChildren }) {
    if (_.isEmpty(apiChildren)) {
      throw Error('Cannot execute the processor because apiChildren is empty');
    }
    this.createDir();

    // 1. Build sidebar component list
    const extraConfig = {
      apiSidebar: _.map(apiChildren, child => `./${child.name}`)
    };
    // 2. Writing extraConfig object as .vuepress/extra.json
    fs.writeFileSync(this.vuepressExtraConfigPath, JSON.stringify(extraConfig), 'utf-8');

    // 3. config
    fs.createReadStream(this.srcConfigPath).pipe(fs.createWriteStream(this.destConfigPath));
  }
}
