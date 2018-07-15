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

	/**
   * Build a sidebar JSON for nested navigations
   * e.g. [{"title":"cluster","collapsable":false,"children":[["./cluster.KMeans","KMeans"]]}
	 * @param apiChildren
	 * @returns {Array}
	 */
  private buildSidebarJSON(apiChildren) {
    return _.reduce(apiChildren, (sum, child) => {
      const [module, name] = child.name.split('.');
      const existingGroupIndex = _.findIndex(sum, (o) => o.title === module);
      if (existingGroupIndex === -1) {
        // If there's no existing module group according to the current child's name
        // create a new definition and append it to the sum
        const newDefinition = {
          title: module,
          collapsable: false,
          children: [[`./${child.name}`, name]]
        };
        return _.concat(sum, [newDefinition]);
      } else {
        // If there's an existing module definition,
        // then append the current child's definition to the children list
        const existing = sum[existingGroupIndex];
        const newChildren = _.concat(existing.children, [[`./${child.name}`, name]]);
        const updated = _.set(existing, 'children', newChildren);
        return _.set(sum, `[${existingGroupIndex}]`, updated);
      }
    }, []);
  }

  public run({ apiChildren }) {
    if (_.isEmpty(apiChildren)) {
      throw Error('Cannot execute the processor because apiChildren is empty');
    }
    this.createDir();

    // 1. Build sidebar component list
    const extraConfig = {
      apiSidebar: this.buildSidebarJSON(apiChildren),
    };
    // 2. Writing extraConfig object as .vuepress/extra.json
    fs.writeFileSync(this.vuepressExtraConfigPath, JSON.stringify(extraConfig), 'utf-8');

    // 3. config
    fs.createReadStream(this.srcConfigPath).pipe(fs.createWriteStream(this.destConfigPath));
  }
}
