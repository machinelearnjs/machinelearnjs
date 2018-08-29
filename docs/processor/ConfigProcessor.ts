import * as fs from 'fs-extra';
import { concat, findIndex, isEmpty, reduce, set } from 'lodash';
import * as path from 'path';
import { BaseProcesser } from './BaseProcesser';

interface SidebarDefinition {
  children: [string, string];
  collapsable: boolean;
  title: string;
}

export class ConfigProcessor extends BaseProcesser {
  private vuepressConfigPath = path.join(__dirname, '../md_out/.vuepress');
  private vuepressExtraConfigPath = path.join(__dirname, '../md_out/.vuepress/extra.json');
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
    // TODO: File copy operations can be simplified using fs-extra
    // 1. Build sidebar component list
    const extraConfig = {
      apiSidebar: this.buildSidebarJSON(apiChildren)
    };
    // 2. Writing extraConfig object as .vuepress/extra.json
    // TODO: Move this to api processor
    fs.writeFileSync(this.vuepressExtraConfigPath, JSON.stringify(extraConfig), 'utf-8');

    // 3. config
    fs.createReadStream(this.srcConfigPath).pipe(fs.createWriteStream(this.destConfigPath));

    // 4. public
    fs.copySync(this.srcPublicPath, this.destPublicPath);

    // 5. Style
    fs.createReadStream(this.srcOverrideStylePath).pipe(fs.createWriteStream(this.destOverrideStylePath));
  }

  /**
   * Create dir if not exist, it can be abstracted to a Utils file
   */
  private createDir(): void {
    // Creating the source out directory if not exists
    if (!fs.existsSync(this.vuepressConfigPath)) {
      fs.mkdirSync(this.vuepressConfigPath);
    }
    // Create public dir if it doesn't exist
    if (!fs.existsSync(this.destPublicPath)) {
      fs.mkdirSync(this.destPublicPath);
    }
  }

  /**
   * Build a sidebar JSON for nested navigations
   * e.g. [{"title":"cluster","collapsable":false,"children":[["./cluster.KMeans","KMeans"]]}
   * @param apiChildren
   * @returns {Array}
   */
  private buildSidebarJSON(apiChildren): SidebarDefinition[] {
    return reduce(
      apiChildren,
      (sum, child) => {
        const [module, name] = child.name.split('.');
        const existingGroupIndex = findIndex(sum, o => o.title === module);
        if (existingGroupIndex === -1) {
          // If there's no existing module group according to the current child's name
          // create a new definition and append it to the sum
          const newDefinition = {
            children: [[`./${child.name}`, name]],
            collapsable: false,
            title: module
          };
          return concat(sum, [newDefinition]);
        } else {
          // If there's an existing module definition,
          // then append the current child's definition to the children list
          const existing = sum[existingGroupIndex];
          const newChildren = concat(existing.children, [[`./${child.name}`, name]]);
          const updated = set(existing, 'children', newChildren);
          return set(sum, `[${existingGroupIndex}]`, updated);
        }
      },
      []
    );
  }
}
