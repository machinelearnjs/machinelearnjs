"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var _ = require("lodash");
var docsJson = require('../docs.json');
/**
 * Processor used to process API docs located under lib/src/
 */
var APIProcessor = /** @class */ (function () {
    function APIProcessor() {
        var _this = this;
        this.themePath = path.join(__dirname, '../themes/markdown');
        this.entityPageFile = 'entity_page.hbs';
        this.apiOutputPath = path.join(__dirname, '../md_out/api');
        this.pathDelimeter = '.';
        this.entityKindWhitelist = ['Class', 'Function']; // Whitelisting kinds when grabbing class or method
        this.moduleNameBlackList = ["\""];
        this.cleanName = function (name) {
            return _.reduce(_this.moduleNameBlackList, function (filteredName, blackKey) {
                return _.replace(filteredName, blackKey, '');
            }, name);
        };
    }
    APIProcessor.prototype.retrieveOrderedAPIs = function (docs) {
        var _this = this;
        // Aggregate children
        var aggregatedFirstChildren = _.reduce(docs.children, function (aggregation, moduleChild) {
            // Looping the first children layer
            // Group child according the module name
            var _a = moduleChild.name.split('/'), module = _a[0], file = _a[1];
            // Clean any unwanted chars from the modulen name
            var cleanedModuleName = _this.cleanName(module);
            // Grabbing each class or method of the module
            // Also it squashes the entities by moduelName.entityName e.g. preprocessing.OneHotEncoder
            var squashedEntityList = _.reduce(moduleChild.children, function (entityList, entityChild) {
                // Filter by entityKindWhitelist
                if (_this.entityKindWhitelist.indexOf(entityChild.kindString) !== -1) {
                    // each function or class name
                    var entityName = entityChild.name;
                    var fullEntityName = [cleanedModuleName, entityName].join(_this.pathDelimeter);
                    var newEntityChild = _.set(entityChild, 'name', fullEntityName);
                    return _.concat(entityList, [newEntityChild]);
                }
                return entityList;
            }, []);
            // Filter out undefined entity appended as a result of whitelisting during the reduce
            var filteredEntityList = _.filter(squashedEntityList, function (x) { return !_.isUndefined(x); });
            // Concat the squashedEntityList to the _.reduce aggregation
            // Also applies a shallow flatten as squashedEntityList is an array
            return _.flatten(_.concat(aggregation, filteredEntityList));
        }, []);
        // Ordering each entity by its name
        return _.orderBy(aggregatedFirstChildren, ["name"]);
    };
    APIProcessor.prototype.run = function (hbs) {
        var _this = this;
        // themes hbs files paths
        var entityPageThemePath = path.join(this.themePath, this.entityPageFile);
        var entityPageThemeContent = fs.readFileSync(entityPageThemePath, 'utf8');
        var orderedFirstChildren = this.retrieveOrderedAPIs(docsJson);
        _.forEach(orderedFirstChildren, function (entityChild) {
            // 1. pages/
            // - create pages using the content
            var fullPath = path.join(_this.apiOutputPath, entityChild.name + ".md");
            var template = hbs.compile(entityPageThemeContent);
            var compiledPage = template(entityChild);
            fs.appendFileSync(fullPath, compiledPage, { flag: 'a' });
        });
    };
    return APIProcessor;
}());
exports.APIProcessor = APIProcessor;
