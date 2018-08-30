import * as fs from 'fs';
import { forEach } from 'lodash';
import * as path from 'path';
import { BaseProcesser } from './BaseProcesser';
import exampleConfig from './exampleConfig';
// import * as path from 'path';

export class ExampleProcessor extends BaseProcesser {
  private vuepressExampleConfigPath = path.join(__dirname, '../md_out/.vuepress/exampleExtra.json');
  private themePath = path.join(__dirname, '../themes/markdown');
  private exampleOutputPath = path.join(__dirname, '../md_out/examples');
  private homePageFile = 'examples_readme.hbs';
  private srcExampleHomeTheme = path.join(this.themePath, this.homePageFile);
  private destExampleHomePage = path.join(__dirname, '../md_out/examples/README.md');
  private examplePageFile = 'example_entity_page.hbs';
  private srcExamplePageTheme = path.join(this.themePath, this.examplePageFile);

  /**
   * Run the processor
   * @param hbs
   */
  public run(hbs): void {
    this.createDir();
    this.createReadMe(hbs);
    this.createExamplePage(hbs);
    this.createSidebar();
  }

  /**
   * Writes the sidebar config for examples
   */
  private createSidebar(): void {
    const config = exampleConfig.map(category => {
      const categoryKey = category.key;
      const categoryTitle = category.title;
      const categoryChildren = category.children.map(child => [`./${categoryKey}/${child.key}.md`, child.title]);
      return {
        children: categoryChildren,
        collapsable: false,
        title: categoryTitle
      };
    });
    const extraConfig = {
      exampleSidebar: config,
    };
    // Writing extraConfig object as .vuepress/exampleExtra.json
    fs.writeFileSync(this.vuepressExampleConfigPath, JSON.stringify(extraConfig), 'utf-8');
  }

  /**
   * Create example directory if not exist
   */
  private createDir(): void {
    if (!fs.existsSync(this.exampleOutputPath)) {
      fs.mkdirSync(this.exampleOutputPath);
    }
  }

  /**
   * Create example category directory if not exist
   * @param fullPath
   */
  private createDirByName(fullPath): void {
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath);
    }
  }

  /**
   * Creates the readme file for examples
   * @param hbs
   */
  private createReadMe(hbs): void {
    const exampleHomePageThemeContent = fs.readFileSync(this.srcExampleHomeTheme, 'utf8');
    const template = hbs.compile(exampleHomePageThemeContent);
    const compiledPage = template(exampleConfig);
    fs.appendFileSync(this.destExampleHomePage, compiledPage, { flag: 'a' });
  }

  private createExamplePage(hbs): void {
    const examplePageThemeContent = fs.readFileSync(this.srcExamplePageTheme, 'utf8');
    const template = hbs.compile(examplePageThemeContent);
    forEach(exampleConfig, category => {
      const categoryKey = category.key;
      const categoryDir = path.join(this.exampleOutputPath, categoryKey);

      // Creates the category dir
      this.createDirByName(categoryDir);

      const categoryChildren = category.children;
      forEach(categoryChildren, child => {
        const childKey = child.key;
        const examplePageName = path.join(categoryDir, `${childKey}.md`);
        const compiledPage = template(child);
        fs.appendFileSync(examplePageName, compiledPage, { flag: 'a' });
      });
    });
  }
}
