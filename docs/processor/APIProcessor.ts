import * as fs from 'fs';
import * as _ from 'lodash';
import * as path from 'path';
import { BaseProcesser } from './BaseProcesser';
import * as consts from './const';
const docsJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../docs.json'), 'utf8'));

interface SidebarDefinition {
  children: [string, string];
  collapsable: boolean;
  title: string;
}

/**
 * Processor used to process API docs located under lib/src/
 */
export class APIProcessor extends BaseProcesser {
  public apiChildren = [];
  private vuepressExtraConfigPath = path.join(__dirname, '../md_out/.vuepress/apiExtra.json');
  private themePath = path.join(__dirname, '../themes/markdown');
  private entityPageFile = 'entity_page.hbs';
  private homePageFile = 'api_readme.hbs';
  private apiOutputPath = path.join(__dirname, '../md_out/api');
  private srcApiHomeTheme = path.join(this.themePath, this.homePageFile);
  private destApiHomePage = path.join(__dirname, '../md_out/api/README.md');
  private pathDelimeter = '.';
  private entityKindWhitelist = [consts.kindStringClass, consts.kindStringFunction]; // Whitelisting kinds when grabbing class or method
  private moduleNameBlackList = ['"'];

  /**
   * Run the processor
   * @param hbs
   */
  public run(hbs): void {
    // Creating required dir
    this.createDir();

    // Order API children
    this.apiChildren = this.retrieveOrderedAPIs(docsJson);
    // Construct the sidebar configs
    this.buildSidebar(this.apiChildren);
    // Create the API homepage
    this.processHomePage(hbs, this.apiChildren);

    // Process API pages
    this.processAPIEntityPage(hbs, this.apiChildren);
  }

  /**
   * Build the sidebar json for the API pages
   * @param apiChildren
   */
  private buildSidebar(apiChildren): void {
    const extraConfig = {
      apiSidebar: this.buildSidebarJSON(apiChildren),
    };
    // Writing extraConfig object as .vuepress/apiExtra.json
    fs.writeFileSync(this.vuepressExtraConfigPath, JSON.stringify(extraConfig), 'utf-8');
  }

  /**
   * Build a sidebar JSON for nested navigations
   * e.g. [{"title":"cluster","collapsable":false,"children":[["./cluster.KMeans","KMeans"]]}
   * @param apiChildren
   * @returns {Array}
   */
  private buildSidebarJSON(apiChildren): SidebarDefinition[] {
    return _.reduce(
      apiChildren,
      (sum, child) => {
        const [module, name] = child.name.split('.');
        const existingGroupIndex = _.findIndex(sum, (o) => o.title === module);
        if (existingGroupIndex === -1) {
          // If there's no existing module group according to the current child's name
          // create a new definition and append it to the sum
          const newDefinition = {
            children: [[`./${child.name}`, name]],
            collapsable: false,
            title: module,
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
      },
      [],
    );
  }

  /**
   * Util funciton to clean any unwanted chars
   * @param name
   * @returns {string}
   */
  private cleanName = (name) => {
    return _.reduce(
      this.moduleNameBlackList,
      (filteredName, blackKey) => {
        return _.replace(filteredName, blackKey, '');
      },
      name,
    );
  };

  /**
   * Retrieve ordered APIs using raw docs generated from typedoc --json
   * @param docs
   * @returns {any[]}
   */
  private retrieveOrderedAPIs(docs): any {
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
            // Filter by entityKindWhitelist and skips if isIgnore comment is set
            if (this.entityKindWhitelist.indexOf(entityChild.kindString) !== -1 && !this.isIgnore(entityChild)) {
              // each function or class name
              const entityName = entityChild.name;
              const fullEntityName = [cleanedModuleName, entityName].join(this.pathDelimeter);
              const newEntityChild = _.set(entityChild, 'name', fullEntityName);
              return _.concat(entityList, [newEntityChild]);
            }
            return entityList;
          },
          [],
        );
        // Filter out undefined entity appended as a result of whitelisting during the reduce
        const filteredEntityList = _.filter(squashedEntityList, (x) => !_.isUndefined(x));

        // Concat the squashedEntityList to the _.reduce aggregation
        // Also applies a shallow flatten as squashedEntityList is an array
        return _.flatten(_.concat(aggregation, filteredEntityList));
      },
      [],
    );

    // Ordering each entity by its name
    return _.orderBy(aggregatedFirstChildren, ['name']);
  }

  /**
   * Create API directory if not exist
   */
  private createDir(): void {
    // 1.2. creating the second portion: /Users/jasons/Desktop/machinelearnjs/docs/md_out/pages
    if (!fs.existsSync(this.apiOutputPath)) {
      fs.mkdirSync(this.apiOutputPath);
    }
  }

  /**
   * Process API folder's homepage aka README
   */
  private processHomePage(hbs, apiChildren): void {
    const grouped = _.groupBy(apiChildren, (o) => o.name.split(this.pathDelimeter)[0]);
    const keys = _.keys(grouped);
    const restructedChildren = _.map(keys, (key) => {
      return {
        key,
        value: _.get(grouped, key),
      };
    });

    const apiHomePageThemeContent = fs.readFileSync(this.srcApiHomeTheme, 'utf8');
    const template = hbs.compile(apiHomePageThemeContent);
    const compiledPage = template(restructedChildren);
    fs.appendFileSync(this.destApiHomePage, compiledPage, { flag: 'a' });
  }

  /**
   * Check if the passed in child has a commnet "ignore"
   * 1. If child does not have comment, search for an identical signature and pull out @ignore tag if it exists
   * @param child
   */
  private isIgnore(child): boolean {
    // Find ignores from given tags
    const findIgnores = (givenTags) =>
      _.find(givenTags, (tag) => {
        return tag.tag === consts.tagTypeIgnore;
      });

    // If child does not have comment attribute by default, then search for a signature
    if (!child.comment) {
      const { signatures } = child;
      const identSignature = _.find(signatures, (sig) => {
        return sig.name === child.name;
      });
      const foundTags = _.get(identSignature, 'comment.tags', []);
      const foundIgnores = findIgnores(foundTags);
      return !_.isEmpty(foundIgnores);
    }
    // Otherwise, evaluate using the parent comment
    const tags = _.get(child, 'comment.tags', []);
    const ignore = findIgnores(tags);
    return !_.isEmpty(ignore);
  }

  /**
   * Processes API entity pages
   * @param hbs
   * @param children
   */
  private processAPIEntityPage(hbs, children): void {
    // themes hbs files paths
    const entityPageThemePath = path.join(this.themePath, this.entityPageFile);
    const entityPageThemeContent = fs.readFileSync(entityPageThemePath, 'utf8');

    _.forEach(children, (entityChild) => {
      // 1. pages/
      // - create pages using the content
      const fullPath = path.join(this.apiOutputPath, `${entityChild.name}.md`);
      const template = hbs.compile(entityPageThemeContent);
      const compiledPage = template(entityChild);
      fs.appendFileSync(fullPath, compiledPage, { flag: 'a' });
    });
  }
}
