const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const Handlebars = require('handlebars');
const docsJson = require('../docs.json');
const pjson = require('../../package.json');

// Params for doc pages
const themePath = path.join(__dirname, '../themes/markdown');
const eneityPageFile = 'entity_page.hbs';
const pagesOutputPath = path.join(__dirname, '../md_out/pages');
const pathDelimeter = '.';
const entityKindWhitelist = ['Class', 'Function'];   // Whitelisting kinds when grabbing class or method
const moduleNameBlackList = ["\""];

// Params for other pages e.g. README
const defaultREADME = true; // To use the default readme
let srcReadMePath = path.join(__dirname, '../../README.md');
const destReadMePath = path.join(__dirname, '../md_out/README.md');

if (!defaultREADME) {
  console.error('Handle default readme false');
}

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

    // Filter by entityKindWhitelist
    if (entityKindWhitelist.indexOf(entityChild.kindString) !== -1) {
      // each function or class name
      const entityName = entityChild.name;
      const fullEntityName = [cleanedModuleName, entityName].join(pathDelimeter);
      const newEntityChild = _.set(entityChild, 'name', fullEntityName);
      return _.concat(entityList, [newEntityChild]);
    }
    return entityList;
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
// 1. Creating pages output dir

// 1.1. creating the first portion: /Users/jasons/Desktop/kalimdorjs/docs/md_out
const pagesOutputPathFirst = pagesOutputPath.split('/').slice(0, -1).join('/')
if (!fs.existsSync(pagesOutputPathFirst)){
  fs.mkdirSync(pagesOutputPathFirst);
}

// 1.2. creating the second portion: /Users/jasons/Desktop/kalimdorjs/docs/md_out/pages
if (!fs.existsSync(pagesOutputPath)) {
  fs.mkdirSync(pagesOutputPath);
}


// Handlebar helpers
const kindStringConst = 'Constructor';
const kindStringMethod = 'Method';

/** Filtering by kind and return a filtered collection */
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

/** Search tree to find an entity with the ID */
const searchInterface = (id) => {
  let candidate = null;
  _.forEach(docsJson.children, (module) => {
    _.forEach(module.children, (entity) => {
      if (entity.id === id) {
        candidate = entity;
      }
    });
  });
  return candidate;
}

/** Construct parameters table */
const PARAM_REFLECTION = 'reflection';
const PARAM_INTRINSIC = 'intrinsic';
const PARAM_ARRAY = 'array';
const PARAM_REFERENCE = 'reference';
const constructParamTable = (parameters) => {
  /**
   * Prioritise getting text instead of shortText
   * @param param
   */
  const getText = (param) => {
    const text = _.get(param,'comment.text');
    const shortText =  _.get(param,'comment.shortText')
    if (text) {
      return text;
    } else if (shortText) {
      return shortText;
    }
    return undefined;
  }
  // Going through the method level params
  // e.g. test(a: {}, b: number, c: string)
  // a -> b -> c
  const consolidatedParams = _.reduce(parameters, (sum, param) => {
    const paramType = param.type.type
    if (PARAM_REFLECTION === paramType) {
      // 1. Handle reflection/named param
      // e.g. x: { test1, test2 }
      _.forEach(param.type.declaration.children, (namedParam) => {
        sum.push([`${param.name}.${namedParam.name}`, namedParam.type.name, namedParam.defaultValue, getText(namedParam)]);
      });
    } else if (PARAM_INTRINSIC === paramType) {
      //  2. Handle any intrintic params
      // e.g. x: number
      sum.push([param.name, param.type.name, param.defaultValue, getText(param)]);
    } else if (PARAM_ARRAY === paramType) {
      // 3. Handle any array params
      // e.g. string[]
      sum.push([param.name, param.type.name, param.defaultValue, getText(param)]);
    } else if (PARAM_REFERENCE === paramType) {
      // 4. Handle any Interface params
      // e.g. x: Options
      const foundRef = searchInterface(param.type.id);
      _.forEach(foundRef.children, (prop) => {
        sum.push([`${param.name}.${prop.name}`, prop.type.name, prop.defaultValue, getText(prop)]);
      });
    }
    return sum;
  }, []);
  // flatten any [ [ [] ] ] 3rd layer arrays
  const tableHeader = '| Param | Type | Default | Description |\n';
  const tableSplit = '| ------ | ------ | ------ | ------ |\n';
  let stringBuilder = `${tableHeader}${tableSplit}`;
  // TODO: Is there a better way of building a string??.. should we do it from the template?
  for (let i = 0; i < _.size(consolidatedParams); i++) {
    const [name, type, defaultValue, description] = consolidatedParams[i];
    stringBuilder += `| ${name} | ${type} | ${defaultValue} | ${description}\n`;
    if (i !== _.size(consolidatedParams) -1) {
      stringBuilder += tableSplit;
    }
  }
  return stringBuilder;
}

Handlebars.registerHelper('constructParamTable', (parameters) => constructParamTable(parameters));

/** Print method return type */
const RETURN_TYPE_INSTRINSIC = 'intrinsic';
const RETURN_TYPE_ARRAY = 'array';
const renderMethodReturnType = (type) => {
  if (type.type === RETURN_TYPE_INSTRINSIC) {
    return type.name;
  } else if (type.type === RETURN_TYPE_ARRAY) {
    return `${type.elementType.name}[]`;
  }
}

Handlebars.registerHelper('renderMethodReturnType', (type) => renderMethodReturnType(type));

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

/**
 * Get a source link such as
 * [ensemble/forest.ts:6](https://github.com/JasonShin/kalimdorjs/blob/master/src/lib/ensemble/forest.ts#L6)
 */
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

  // 1. pages/
  const fullPath = path.join(pagesOutputPath, `${entityChild.name}.md`);
  const template = Handlebars.compile(entityPageContent);
  const compiledPage = template(entityChild);
  fs.appendFileSync(fullPath, compiledPage, { flag: 'a' });

  // 2. Other pages
  fs.createReadStream(srcReadMePath).pipe(fs.createWriteStream(destReadMePath));

});

