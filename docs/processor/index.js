const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const docsJson = require('../docs.json');

// Params
const outputPath = path.join(__dirname, '../md_out');
const pathDelimeter = '.';
const entityKindWhitelist = ['Class', 'Function'];   // Whitelisting kinds when grabbing class or method
const moduleNameBlackList = ["\""];

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

// Writing each entity page
_.forEach(orderedFirstChildren, (entityChild) => {
  const fullPath = path.join(outputPath, `${entityChild.name}.md`);
  fs.appendFileSync(fullPath, '#test!', { flag: 'a' });

});

