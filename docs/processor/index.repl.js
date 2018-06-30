"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var Handlebars = require("handlebars");
var APIProcessor_1 = require("./APIProcessor");
var docsJson = require('../docs.json');
var pjson = require('../../package.json');
var kindStringConst = 'Constructor';
var kindStringMethod = 'Method';
var HandlebarHelpers = /** @class */ (function () {
    function HandlebarHelpers() {
    }
    /**
   * Filters a children by a kind name such as Constructor or Method
     * @param children
     * @param options
     * @param kind
     * @returns {any}
     */
    HandlebarHelpers.filterByKind = function (children, options, kind) {
        if (children) {
            var filtered = children.filter(function (child) {
                return child.kindString === kind;
            });
            return _.isEmpty(filtered) ? options.inverse(this) : options.fn(filtered);
        }
        else {
            return options.inverse(children);
        }
    };
    /**
   * Search tree to find an entity with the ID
     * @param docs
     * @param id
     * @returns {any}
     */
    HandlebarHelpers.searchInterface = function (docs, id) {
        var candidate = null;
        _.forEach(docs, function (module) {
            _.forEach(module.children, function (entity) {
                if (entity.id === id) {
                    candidate = entity;
                }
            });
        });
        return candidate;
    };
    return HandlebarHelpers;
}());
exports.HandlebarHelpers = HandlebarHelpers;
Handlebars.registerHelper("filterConstructor", function (children, options) {
    return HandlebarHelpers.filterByKind(children, options, kindStringConst);
});
Handlebars.registerHelper("filterMethod", function (children, options) {
    return HandlebarHelpers.filterByKind(children, options, kindStringMethod);
});
/** Search tree to find an entity with the ID */
var searchInterface = function (id) {
    var candidate = null;
    _.forEach(docsJson.children, function (module) {
        _.forEach(module.children, function (entity) {
            if (entity.id === id) {
                candidate = entity;
            }
        });
    });
    return candidate;
};
/** Construct parameters table */
var PARAM_REFLECTION = 'reflection';
var PARAM_INTRINSIC = 'intrinsic';
var PARAM_ARRAY = 'array';
var PARAM_REFERENCE = 'reference';
var constructParamTable = function (parameters) {
    /**
     * Prioritise getting text instead of shortText
     * @param param
     */
    var getText = function (param) {
        var text = _.get(param, 'comment.text');
        var shortText = _.get(param, 'comment.shortText');
        if (text) {
            return text;
        }
        else if (shortText) {
            return shortText;
        }
        return undefined;
    };
    // Going through the method level params
    // e.g. test(a: {}, b: number, c: string)
    // a -> b -> c
    var consolidatedParams = _.reduce(parameters, function (sum, param) {
        var paramType = param.type.type;
        if (PARAM_REFLECTION === paramType) {
            // 1. Handle reflection/named param
            // e.g. x: { test1, test2 }
            _.forEach(param.type.declaration.children, function (namedParam) {
                sum.push([param.name + "." + namedParam.name, namedParam.type.name, namedParam.defaultValue, getText(namedParam)]);
            });
        }
        else if (PARAM_INTRINSIC === paramType) {
            //  2. Handle any intrintic params
            // e.g. x: number
            sum.push([param.name, param.type.name, param.defaultValue, getText(param)]);
        }
        else if (PARAM_ARRAY === paramType) {
            // 3. Handle any array params
            // e.g. string[]
            sum.push([param.name, param.type.name, param.defaultValue, getText(param)]);
        }
        else if (PARAM_REFERENCE === paramType) {
            // 4. Handle any Interface params
            // e.g. x: Options
            var foundRef = searchInterface(param.type.id);
            _.forEach(foundRef.children, function (prop) {
                sum.push([param.name + "." + prop.name, prop.type.name, prop.defaultValue, getText(prop)]);
            });
        }
        return sum;
    }, []);
    // flatten any [ [ [] ] ] 3rd layer arrays
    var tableHeader = '| Param | Type | Default | Description |\n';
    var tableSplit = '| ------ | ------ | ------ | ------ |\n';
    var stringBuilder = "" + tableHeader + tableSplit;
    // TODO: Is there a better way of building a string??.. should we do it from the template?
    for (var i = 0; i < _.size(consolidatedParams); i++) {
        var _a = consolidatedParams[i], name_1 = _a[0], type = _a[1], defaultValue = _a[2], description = _a[3];
        stringBuilder += "| " + name_1 + " | " + type + " | " + defaultValue + " | " + description + "\n";
        if (i !== _.size(consolidatedParams) - 1) {
            stringBuilder += tableSplit;
        }
    }
    return stringBuilder;
};
Handlebars.registerHelper('constructParamTable', function (parameters) { return constructParamTable(parameters); });
/** Print method return type */
var RETURN_TYPE_INSTRINSIC = 'intrinsic';
var RETURN_TYPE_ARRAY = 'array';
var renderMethodReturnType = function (type) {
    if (type.type === RETURN_TYPE_INSTRINSIC) {
        return type.name;
    }
    else if (type.type === RETURN_TYPE_ARRAY) {
        return type.elementType.name + "[]";
    }
};
Handlebars.registerHelper('renderMethodReturnType', function (type) { return renderMethodReturnType(type); });
/** Renderers */
/**
 * Gets method () block next to the method name
 * e.g. (props: any, x: string)
 **/
Handlebars.registerHelper('methodBracket', function (parameters) {
    var params = _.map(parameters, function (param) {
        var paramType = _.isString(param.type) ? param.type : 'object';
        return param.name + ": *`" + paramType + "`*";
    });
    return "(" + params.join(',') + ")";
});
/**
 * Get a source link such as
 * [ensemble/forest.ts:6](https://github.com/JasonShin/kalimdorjs/blob/master/src/lib/ensemble/forest.ts#L6)
 */
Handlebars.registerHelper('getSourceLink', function (sources) {
    var defined = _.map(sources, function (src) {
        return "[" + src.fileName + ":" + src.line + "](" + pjson.repository + "/blob/master/src/lib/" + src.fileName + "#L" + src.line + ")";
    });
    return defined.join(',');
});
/** Create a newline */
Handlebars.registerHelper('newLine', function () { return '\n'; });
var processor = new APIProcessor_1.APIProcessor();
processor.run(Handlebars);
