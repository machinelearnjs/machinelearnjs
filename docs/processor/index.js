const _ = require('lodash');
const docsJson = require('../docs.json');

// Params
const pathDelimeter = '.';
const entityKindWhitelist = ['Class', 'Function'];   // Whitelisting kinds when grabbing class or method

// 1. data preprocessing
// Aggregate children
const aggregatedFirstChildren = _.reduce(docsJson.children, (aggregation, moduleChild) => {
  // Looping the first children layer
  // Group child according the module name
  const [ module, file ] = moduleChild.name.split('/');

  // Grabbing each class or method of the module
  // Also it squashes the entities by moduelName.entityName e.g. preprocessing.OneHotEncoder
  const squashedEntityList = _.reduce(moduleChild.children, (entityList, entityChild) => {
    // Filter by kindWhiteList
    if (entityKindWhitelist.indexOf(entityChild.kindString) !== -1) {
      // each function or class name
      const entityName = entityChild.name;
      const fullEntityName = [module, entityName].join(pathDelimeter)
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

// const orderedFirstChildren = _.orderBy(aggregatedFirstChildren, ["name"]);
console.log(aggregatedFirstChildren);

