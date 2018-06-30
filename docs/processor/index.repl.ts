import * as _ from 'lodash';
import * as Handlebars from 'handlebars';
import { APIProcessor } from './APIProcessor';
const docsJson = require('../docs.json');
const pjson = require('../../package.json');

const kindStringConst = 'Constructor';
const kindStringMethod = 'Method';

const paramTypeReflection = 'reflection';
const paramTypeIntrinsic = 'intrinsic';
const paramTypeArray = 'array';
const paramTypeReference = 'reference';

export class HandlebarHelpers {

	/**
   * Filters a children by a kind name such as Constructor or Method
	 * @param children
	 * @param options
	 * @param kind
	 * @returns {any}
	 */
  static filterByKind(children, options, kind) {
    if (children) {
      const filtered = children.filter((child) => {
        return child.kindString === kind;
      });
      return _.isEmpty(filtered) ? options.inverse(this) : options.fn(filtered);
    } else {
      return options.inverse(children);
    }
  }

	/**
   * Search tree to find an entity with the ID
	 * @param docs
	 * @param id
	 * @returns {any}
	 */
  private searchInterface(docs, id) {
    let candidate = null;
    _.forEach(docs, (module) => {
      _.forEach(module.children, (entity) => {
        if (entity.id === id) {
          candidate = entity;
        }
      });
    });
    return candidate;
  }

  static constructParamTable(parameters) {
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
      if (paramTypeReference === paramType) {
        // 1. Handle reflection/named param
        // e.g. x: { test1, test2 }
        _.forEach(param.type.declaration.children, (namedParam) => {
          sum.push([`${param.name}.${namedParam.name}`, namedParam.type.name, namedParam.defaultValue, getText(namedParam)]);
        });
      } else if (paramTypeIntrinsic === paramType) {
        //  2. Handle any intrintic params
        // e.g. x: number
        sum.push([param.name, param.type.name, param.defaultValue, getText(param)]);
      } else if (paramTypeArray === paramType) {
        // 3. Handle any array params
        // e.g. string[]
        sum.push([param.name, param.type.name, param.defaultValue, getText(param)]);
      } else if (paramTypeReference === paramType) {
        // 4. Handle any Interface params
        // e.g. x: Options
        const foundRef = this.searchInterface(param.type.id);
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
}

Handlebars.registerHelper("filterConstructor", (children, options) =>
  HandlebarHelpers.filterByKind(children, options, kindStringConst));

Handlebars.registerHelper("filterMethod", (children, options) =>
  HandlebarHelpers.filterByKind(children, options, kindStringMethod));

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


const processor = new APIProcessor();
processor.run(Handlebars);
