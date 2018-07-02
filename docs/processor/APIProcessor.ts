import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import { BaseProcesser } from './BaseProcesser';
const docsJson = require('../docs.json');

/**
 * Processor used to process API docs located under lib/src/
 */
export class APIProcessor extends BaseProcesser {
  public apiChildren = [];
  private themePath = path.join(__dirname, '../themes/markdown');
  private entityPageFile = 'entity_page.hbs';
  private homePageFile = 'api_readme.hbs';
  private apiOutputPath = path.join(__dirname, '../md_out/api');
  private srcApiHomeTheme = path.join(this.themePath, this.homePageFile);
  private destApiHomePage = path.join(__dirname, '../md_out/api/README.md');
  private pathDelimeter = '.';
  private entityKindWhitelist = ['Class', 'Function']; // Whitelisting kinds when grabbing class or method
  private moduleNameBlackList = ['"'];
  /**
   * Util funciton to clean any unwanted chars
   * @param name
   * @returns {string}
   */
  private cleanName = name => {
    return _.reduce(
      this.moduleNameBlackList,
      (filteredName, blackKey) => {
        return _.replace(filteredName, blackKey, '');
      },
      name
    );
  };

  /**
   * Retrieve ordered APIs using raw docs generated from typedoc --json
   * @param docs
   * @returns {any[]}
   */
  private retrieveOrderedAPIs(docs) {
    // Aggregate children
    const aggregatedFirstChildren = _.reduce(
      docs.children,
      (aggregation, moduleChild) => {
        // Looping the first children layer
        // Group child according the module name
        const [module, file] = moduleChild.name.split('/');
        // Clean any unwanted chars from the modulen name
        const cleanedModuleName = this.cleanName(module);
        // Grabbing each class or method of the module
        // Also it squashes the entities by moduelName.entityName e.g. preprocessing.OneHotEncoder
        const squashedEntityList = _.reduce(
          moduleChild.children,
          (entityList, entityChild) => {
            // Filter by entityKindWhitelist
            if (
              this.entityKindWhitelist.indexOf(entityChild.kindString) !== -1
            ) {
              // each function or class name
              const entityName = entityChild.name;
              const fullEntityName = [cleanedModuleName, entityName].join(
                this.pathDelimeter
              );
              const newEntityChild = _.set(entityChild, 'name', fullEntityName);
              return _.concat(entityList, [newEntityChild]);
            }
            return entityList;
          },
          []
        );
        // Filter out undefined entity appended as a result of whitelisting during the reduce
        const filteredEntityList = _.filter(
          squashedEntityList,
          x => !_.isUndefined(x)
        );

        // Concat the squashedEntityList to the _.reduce aggregation
        // Also applies a shallow flatten as squashedEntityList is an array
        return _.flatten(_.concat(aggregation, filteredEntityList));
      },
      []
    );

    // Ordering each entity by its name
    return _.orderBy(aggregatedFirstChildren, ['name']);
  }

  /**
   * Create API directory if not exist
   */
  private createDir() {
    // 1.2. creating the second portion: /Users/jasons/Desktop/kalimdorjs/docs/md_out/pages
    if (!fs.existsSync(this.apiOutputPath)) {
      fs.mkdirSync(this.apiOutputPath);
    }
  }

  /**
   * Process API folder's homepage aka README
   */
  private processHomePage(hbs, apiChildren) {
    const grouped = _.groupBy(
      apiChildren,
      o => o.name.split(this.pathDelimeter)[0]
    );
    const keys = _.keys(grouped);
    const restructedChildren = _.map(keys, key => {
      return {
        key,
        value: _.get(grouped, key)
      };
    });

    const apiHomePageThemeContent = fs.readFileSync(
      this.srcApiHomeTheme,
      'utf8'
    );
    const template = hbs.compile(apiHomePageThemeContent);
    const compiledPage = template(restructedChildren);
    fs.appendFileSync(this.destApiHomePage, compiledPage, { flag: 'a' });
  }

  /**
   * Processes API entity pages
   * @param hbs
   * @param children
   */
  private processAPIEntityPage(hbs, children) {
    // themes hbs files paths
    const entityPageThemePath = path.join(this.themePath, this.entityPageFile);
    const entityPageThemeContent = fs.readFileSync(entityPageThemePath, 'utf8');

    _.forEach(children, entityChild => {
      // 1. pages/
      // - create pages using the content
      const fullPath = path.join(this.apiOutputPath, `${entityChild.name}.md`);
      const template = hbs.compile(entityPageThemeContent);
      const compiledPage = template(entityChild);
      fs.appendFileSync(fullPath, compiledPage, { flag: 'a' });
    });
  }

  /**
   * Run the processor
   * @param hbs
   */
  public run(hbs) {
    // Creating required dir
    this.createDir();

    // Order API children
    this.apiChildren = this.retrieveOrderedAPIs(docsJson);
    // TODO: Process homepage to display all the APIs on the homepage
    this.processHomePage(hbs, this.apiChildren);

    // Process API pages
    this.processAPIEntityPage(hbs, this.apiChildren);
  }
}
