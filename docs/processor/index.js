const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const Handlebars = require('handlebars');
const docsJson = require('../docs.json');
const pjson = require('../../package.json');

// Params
const themePath = path.join(__dirname, '../themes/markdown');
const eneityPageFile = 'entity_page.hbs';
const outputPath = path.join(__dirname, '../md_out');
const pathDelimeter = '.';
const entityKindWhitelist = ['Class', 'Function'];   // Whitelisting kinds when grabbing class or method
const moduleNameBlackList = ["\""];


// pages
const entityPagePath = path.join(themePath, eneityPageFile);
const entityPageContent = fs.readFileSync(entityPagePath, 'utf8');


// 1. data preprocessing
const cleanName = (name) => {
  return _.reduce(moduleNameBlackList, (filteredName, blackKey) => {
    return _.replace(filteredName, blackKey, '');
  }, name);
}

// Aggregate children
const aggregatedFirstChildren = _.reduce(docsJson.children, (aggregation, moduleChild) => {
  // Looping the first children layer
  // Group child according the module name
  const [ module, file ] = moduleChild.name.split('/');
  // Clean any unwanted chars from the modulen name
  const cleanedModuleName = cleanName(module);
  // Grabbing each class or method of the module
  // Also it squashes the entities by moduelName.entityName e.g. preprocessing.OneHotEncoder
  const squashedEntityList = _.reduce(moduleChild.children, (entityList, entityChild) => {
    // Filter by kindWhiteList
    if (entityKindWhitelist.indexOf(entityChild.kindString) !== -1) {
      // each function or class name
      const entityName = entityChild.name;
      const fullEntityName = [cleanedModuleName, entityName].join(pathDelimeter);
      const newEntityChild = _.set(entityChild, 'name', fullEntityName);
      return _.concat(entityList, newEntityChild);
    }
  }, []);
  // Filter out undefined entity appended as a result of whitelisting during the reduce
  const filteredEntityList = _.filter(squashedEntityList, (x) => !_.isUndefined(x));
  // Concat the squashedEntityList to the _.reduce aggregation
  // Also applies a shallow flatten as squashedEntityList is an array
  return _.flatten(_.concat(aggregation, filteredEntityList));
}, []);

// Ordering each entity by its name
const orderedFirstChildren = _.orderBy(aggregatedFirstChildren, ["name"]);

// Creating the source out directory if not exists
if (!fs.existsSync(outputPath)){
  fs.mkdirSync(outputPath);
}

// Handlebar helpers

const kindStringConst = 'Constructor';
const kindStringMethod = 'Method';

/**
 * Check if a child is an instance of X
 * @param conditional
 * @param options
 * @param kind
 */
const ifChildX = (child, options, kind) => {
  if (_.isEqual(child.kindString, kind)) {
    return options.fn(child);
  } else {
    return options.inverse(child);
  }
}
/** Check if a child is a Constructor */
Handlebars.registerHelper("ifConstructor", (child, options) =>
  ifChildX(child, options, kindStringConst));

/** Check if a child is a Method */
Handlebars.registerHelper("ifMethod", (child, options) =>
  ifChildX(child, options, kindStringMethod));


/**
 * Check if a collection has any X
 * Returns the children back in the end
 * @param children
 * @param options
 * @param kind
 * @returns {*}
 */
const hasCollectionX = (children, options, kind) => {
  if (children) {
    const hasConst = children.some((prop) => {
      return prop.kindString === kind;
    });
    return hasConst ? options.fn(children) : options.inverse(children);
  } else {
    return options.inverse(children);
  }
}


Handlebars.registerHelper("hasConstructor", (children, options) =>
  hasCollectionX(children, options, kindStringConst));

Handlebars.registerHelper("hasMethod", (children, options) =>
  hasCollectionX(children, options, kindStringMethod));


/** Filtering  */
const filterByKind = (children, options, kind) => {
  if (children) {
    const filtered = children.filter((child) => {
      return child.kindString === kind;
    });
    return _.isEmpty(filtered) ? options.inverse(this) : options.fn(filtered);
  } else {
    return options.inverse(children);
  }
}

Handlebars.registerHelper("filterConstructor", (children, options) =>
  filterByKind(children, options, kindStringConst));

Handlebars.registerHelper("filterMethod", (children, options) =>
  filterByKind(children, options, kindStringMethod));


/** Renderers */

/**
 * Gets method () block next to the method name
 * e.g. (props: any, x: string)
 **/
Handlebars.registerHelper('methodBracket', (parameters) => {
  const params = _.map(parameters, (param) => {
    const paramType = _.isString(param.type) ? param.type : 'object';
    return `${param.name}: *\`${paramType}\`*`;
  });
  return `(${params.join(',')})`
});

Handlebars.registerHelper('getSourceLink', (sources) => {
  const defined =_.map(sources, (src) => {
    return `[${src.fileName}:${src.line}](${pjson.repository}/blob/master/src/lib/${src.fileName}#L${src.line})`
  });
  return defined.join(',');
});

/** Create a newline */
Handlebars.registerHelper('newLine', () => '\n');


// Writing each entity page
_.forEach(orderedFirstChildren, (entityChild) => {
  const fullPath = path.join(outputPath, `${entityChild.name}.md`);
  const template = Handlebars.compile(entityPageContent);
  const compiledPage = template(entityChild);
  // Write actual file
  fs.appendFileSync(fullPath, compiledPage, { flag: 'a' });

});

