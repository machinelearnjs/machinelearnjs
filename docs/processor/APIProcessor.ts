import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
const docsJson = require('../docs.json');

/**
 * Processor used to process API docs located under lib/src/
 */
export class APIProcessor {
  private themePath = path.join(__dirname, '../themes/markdown');
  private entityPageFile = 'entity_page.hbs';
  private apiOutputPath = path.join(__dirname, '../md_out/api');
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
   * Run the processor
   * @param hbs
   */
  public run(hbs) {
    // themes hbs files paths
    const entityPageThemePath = path.join(this.themePath, this.entityPageFile);
    const entityPageThemeContent = fs.readFileSync(entityPageThemePath, 'utf8');

    const orderedFirstChildren = this.retrieveOrderedAPIs(docsJson);
    _.forEach(orderedFirstChildren, entityChild => {
      // 1. pages/
      // - create pages using the content
      const fullPath = path.join(this.apiOutputPath, `${entityChild.name}.md`);
      const template = hbs.compile(entityPageThemeContent);
      const compiledPage = template(entityChild);
      fs.appendFileSync(fullPath, compiledPage, { flag: 'a' });
    });
  }
}
