import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import * as _ from 'lodash';
import * as path from 'path';
import { APIProcessor } from './APIProcessor';
import { ConfigProcessor } from './ConfigProcessor';
import * as consts from './const';
import { ExampleProcessor } from './ExampleProcessor';
import { PagesProcessor } from './PagesProcessor';
import { RedirectProcessor } from './RedirectProcessor';

const docsJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../docs.json'), 'utf8'));
const pjson = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8'));

/**
 * check equality of x and y.
 * If they are equal, returns true(context e.g. children) || false(context e.g. children)
 * @param children
 * @param x
 * @param y
 * @param options
 * @returns {any}
 */
export function ifEquals(children, x, y, options): any {
  return _.isEqual(x, y) ? options.fn(children) : options.inverse(children);
}

/**
 * Filters children by a kind name such as Constructor or Method
 * @param children
 * @param options
 * @param kind
 * @returns {any}
 */
export function filterByKind(children, options, kind): any {
  if (children) {
    const filtered = children.filter((child) => {
      return child.kind === kind;
    });

    return _.isEmpty(filtered) ? options.inverse(children) : options.fn(filtered);
  } else {
    return options.inverse(children);
  }
}

/**
 * Filters children by its tag name. For example filter by tag "example" of below
 * [{"tag":"example","text":"\nhello('test');\n\n"}, {"tag": "somethingelse"}]
 * would result in
 * [{"tag":"example","text":"\nhello('test');\n\n"}]
 * @param children
 * @param options
 * @param tag
 * @returns {any}
 */
export function filterByTag(children, options, tag): any {
  if (children) {
    const filtered = children.filter((child) => {
      return child.tag === tag || child.tag === `@${tag}`;
    });
    return _.isEmpty(filtered) ? options.inverse(children) : options.fn(filtered);
  } else {
    return options.inverse(children);
  }
}

/**
 * Search the docs to find an entity with the ID
 * @param docs
 * @param id
 * @returns {any}
 */
export function searchInterface(docs, id): any {
  let candidate = null;
  _.forEach(docs.children, (module) => {
    _.forEach(module.children, (entity) => {
      if (entity.id === id) {
        candidate = entity;
      }
    });
  });
  return candidate;
}

/**
 * Check if a signatures collection is empty
 * 1. If signature itself is empty or undefined
 * 2. If the first signature does not contain "parameters"
 * @param context - current context, typically this
 * @param options
 */
export function isSignatureValid(context, options): any {
  const signatures = context.signatures;
  if (_.isEmpty(signatures) || !signatures) {
    return options.inverse(context);
  }

  const firstSignature: any = _.first(signatures);
  // Flag to make sure parameters or type exist
  const signatureOrType = firstSignature.parameters || firstSignature.type;
  if (_.isEmpty(signatureOrType) || !signatureOrType) {
    return options.inverse(context);
  }

  // Otherwise returns true
  return options.fn(context);
}

/**
 * Traverses a definition for an Array and returns a string representation
 * @param arrayTree
 * @param {string} result
 * @returns {any}
 */
export function traverseArrayDefinition(arrayTree, result = ''): string {
  // const type = arrayTree.type;
  const element = arrayTree.elementType;
  const elementName = element.name;
  const elementType = element.type;
  // tslint:disable-next-line
  result = result + '[]';
  if (consts.paramTypeArray === elementType) {
    return traverseArrayDefinition(element, result);
  }
  return `${elementName}${result}`;
}

/**
 * Construct a list of string representations of Matrix
 *
 * @example
 * constructMatrixType('Type2DMatrix', [{ type: 'intrinsic', name: 'string' }])
 * // 'string[][]'
 *
 * @param dim
 * @param types
 */
export function constructMatrixType(dim: string, types: [{ type: string; name: string }]): string {
  if (dim === null || dim === undefined) {
    throw new TypeError('dim should not be null or undefined');
  }

  if (_.isEmpty(types)) {
    throw new TypeError('types cannot be empty!');
  }

  const buffer = [];
  let brackets;
  if (dim === consts.type1DMatrix) {
    brackets = '[]';
  } else if (dim === consts.type2DMatrix) {
    brackets = '[][]';
  } else if (dim === consts.type3DMatrix) {
    brackets = '[][][]';
  } else if (dim === consts.type4DMatrix) {
    brackets = '[][][][]';
  }

  types.forEach((type) => {
    buffer.push(`${type.name}${brackets}`);
  });

  // Joining everything and returns a string
  return buffer.join(' or ');
}

/**
 * Prioritise getting text instead of shortText description
 * @param param
 */
export function getText(param): string | undefined {
  if (_.isEmpty(param)) {
    throw new TypeError('Param should not be null or undefined');
  }

  if (param.comment && param.comment.summary) {
    return param.comment.summary.map((summary) => summary.text).join('\n');
  }
  // Supporting legacy getText
  if (param.comment) {
    return param.comment.text;
  }
  return undefined;
}

/**
 * Constructs a parameter table that may look something like:
 * | Param | Type | Default | Description |
 * | ------ | ------ | ------ | ------ |
 * | object.X | any |  | array-like or sparse matrix of shape &#x3D; [nsamples, n_features]
 * | object.y | any |  | array-like, shape &#x3D; [nsamples] or [n_samples, n_outputs]
 *
 * @param parameters
 * @returns {string}
 */
export function constructParamTable(parameters): string {
  // Param table characters blacklist
  const paramTableCharsBlackList = [/\n/g, /\r\n/g];

  /**
   * Generic clean function before displaying it on the table parameters
   * @param text
   * @returns {string}
   */
  const cleanTableText = (text) => {
    const blacklistCleaned = _.reduce(
      paramTableCharsBlackList,
      (result, rmChar) => {
        return _.replace(result, rmChar, '');
      },
      text,
    );
    return _.trim(blacklistCleaned);
  };

  /**
   * Transforms param types, for example number[] or number[][]
   * @param obj
   */
  const renderParamType = (obj) => {
    if (obj.type === consts.paramTypeArray) {
      // Handling arrays
      return traverseArrayDefinition(obj);
    } else {
      // Handling anything other than arrays
      return obj.name;
    }
  };

  /**
   * Builds a readable reference parameter and append the result to the sum array
   * @param param
   * @param sum
   * @param typeId
   */
  const buildParamsFromReference = (param, sum, typeId, preprend = 'options') => {
    const foundRef = searchInterface(docsJson, typeId);
    if (_.isEmpty(foundRef)) {
      // Handling the TS native references
      _.forEach(param.type.typeArguments, (prop) => {
        // Building a readable type arguments
        let args: string;
        if (_.isArray(prop.typeArguments)) {
          args = prop.typeArguments.map(renderParamType).join(' | ');
        } else if (prop.constraint) {
          args = prop.constraint.type + ' ' + prop.constraint.types.map(renderParamType).join(' | ');
        } else {
          args = prop.name;
        }
        sum.push([`${param.name}`, args, prop.defaultValue, getText(param)]);
      });
    } else if (foundRef.kindString === consts.refKindInterface) {
      _.forEach(foundRef.children, (prop) => {
        sum.push([`${param.name}.${prop.name}`, renderParamType(prop.type), prop.defaultValue, getText(param)]);
      });
    } else if (foundRef.kindString === consts.refKindTypeAlias || foundRef.kind === consts.refNumberTypeAlias) {
      // Handling a custom `type` such as Type2DMatrix or Type3DMatrix
      const { type } = foundRef.type;
      if (type === consts.returnTypeArray) {
        // For each TypeXMatrix render its array representation as a string
        // example: number[][][] | string[][][]
        const { typeArguments } = param.type;
        // const refType = foundRef.type.type;
        const refName = foundRef.name;
        const typeList = [];
        for (let i = 0; i < typeArguments.length; i++) {
          const typeArg = typeArguments[i];
          // at this point use typeParameters.kind
          if (typeArg.type === consts.refTypeArgTypeUnion) {
            const types = typeArg.types;
            typeList.push(constructMatrixType(refName, types));
          } else if (typeArg.type === consts.refTypeTypeParameter) {
            const types = typeArg.constraint.types;
            typeList.push(constructMatrixType(refName, types));
          } else if (typeArg.type === consts.refTypeArgTypeIntrinsic) {
            typeList.push(constructMatrixType(refName, [typeArg]));
          } else {
            typeList.push('unknown');
          }
        }
        sum.push([param.name, typeList.join(' or '), param.defaultValue, getText(param)]);
      }
    } else if (foundRef.kindString === consts.kindStringEnum) {
      sum.push([
        `${preprend}.${param.name}`,
        foundRef.children.map((x) => x.name).join(' or '),
        param.defaultValue,
        getText(param),
      ]);
    }
  };

  // Going through the method level params
  // e.g. test(a: {}, b: number, c: string)
  // a -> b -> c
  const consolidatedParams = _.reduce(
    parameters,
    (sum, param) => {
      const paramType = param.type.type;
      if (consts.paramTypeReflection === paramType) {
        // 1. Handle reflection/named param
        // e.g. x: { test1, test2 }
        _.forEach(param.type.declaration.children, (namedParam) => {
          // const foundRef = searchInterface(docsJson, namedParam.type.id);
          if (consts.paramTypeReference === namedParam.type.type) {
            // If the reflection is actually a reference, such as ENUM, then buildParamFromReference
            buildParamsFromReference(namedParam, sum, namedParam.type?.elementType?.target ?? namedParam.type.target);
          } else {
            sum.push([
              `options.${namedParam.name}`,
              renderParamType(namedParam.type),
              namedParam.defaultValue,
              getText(namedParam),
            ]);
          }
          // buildParamsFromReference(param, sum, namedParam.type.id);
        });
      } else if (consts.paramTypeIntrinsic === paramType) {
        //  2. Handle any intrintic params
        // e.g. x: number
        sum.push([param.name, renderParamType(param.type), param.defaultValue, getText(param)]);
      } else if (consts.paramTypeArray === paramType) {
        // 3. Handle any array params
        // e.g. string[]
        sum.push([param.name, renderParamType(param.type), param.defaultValue, getText(param)]);
      } else if (consts.paramTypeReference === paramType) {
        // 4.1. Handle any TS native references -> determined by _.isEmpty(foundRef)
        // e.g. x: IterableIterator
        // 4.2. Handle any custom defined interfaces / references. Custom references should have an ID that references definition within the docs.json
        // e.g. x: Options
        // tslint:disable-next-line:no-console
        buildParamsFromReference(param, sum, param.type.id ?? param.type.target);
      } else if (consts.paramTypeUnion === paramType) {
        // 5. Handles any union types.
        // e.g. string[] | string[][]
        const unionTypes = _.map(param.type.types, (singleType) => {
          if (singleType.type === consts.paramTypeReference) {
            return constructMatrixType(singleType.name, singleType.typeArguments);
          }
          return renderParamType(singleType);
        });
        const unionTypesStr = unionTypes.join(' or ');
        sum.push([param.name, unionTypesStr, param.defaultValue, getText(param)]);
      }
      return sum;
    },
    [],
  );

  // flatten any [ [ [] ] ] 3rd layer arrays
  const tableHeader = '| Param | Type | Default | Description |\n';
  const tableSplit = '| ------ | ------ | ------ | ------ |\n';
  let stringBuilder = `${tableHeader}${tableSplit}`;
  // TODO: Is there a better way of building a string??.. should we do it from the template?
  for (let i = 0; i < _.size(consolidatedParams); i++) {
    const [name, type, defaultValue, description] = consolidatedParams[i];
    const cleanName = cleanTableText(name);
    const cleanType = cleanTableText(type);
    const cleanDefaultValue = cleanTableText(defaultValue);
    const cleanDescription = cleanTableText(description);
    stringBuilder += `| ${cleanName} | ${cleanType} | ${cleanDefaultValue} | ${cleanDescription}\n`;
  }
  return stringBuilder;
}

/**
 * Construct a return table that may look something like:
 * | Param | Type | Description |
 * | ------ | ------ | ------ |
 * | X | any | array-like or sparse matrix of shape &#x3D; [nsamples, n_features]
 * | y | any | array-like, shape &#x3D; [nsamples] or [n_samples, n_outputs]
 *
 * @param typeArgument - example of typeArgument looks like:
 * typeArguments": { "type": "reflection", "declaration": {... children}
 */
function constructReturnTable(typeArgument): string {
  const children = typeArgument.declaration.children;
  let table = '| Param | Type | Description |\n';
  table += '| ------ | ------ | ------ |\n';
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const type = child.type.type;
    if (type === consts.returnTypeIntrinsic) {
      // If it's a simple type, such as string, number and etc
      table += `| ${child.name} | ${child.type.name} | ${getText(child)}\n`;
    } else if (type === consts.returnTypeArray) {
      table += `| ${child.name} | ${traverseArrayDefinition(child.type)} | ${getText(child)}\n`;
    }
  }
  return table;
}

/**
 * Renders method return type
 * This is slightly different to parameter renderer as it will simply return
 * type.name if it's a simple return type
 * @param type
 * @returns {string}
 */
export function renderMethodReturnType(type): any {
  if (type.type === consts.returnTypeIntrinsic) {
    // Handles a simple promise return type
    return type.name;
  } else if (type.type === consts.returnTypeArray) {
    // Handles an Array promise return type
    return traverseArrayDefinition(type);
  } else if (type.type === consts.returnTypeReflection) {
    // Handles object return type
    return constructReturnTable(type);
  } else if (type.type === consts.returnTypeReference && type.name === consts.returnNamePromise) {
    // Handles return type that returns a complex object
    const returnTypes = type.typeArguments.map((typeArg) => {
      let result;
      if (typeArg.type === consts.returnTypeIntrinsic) {
        // Simply return name if it's an intrinsic type
        result = ':metal: Promise';
        result += `<${typeArg.name}>`;
      } else if (typeArg.type === consts.returnTypeReflection) {
        // If it's a reflection type, an object, then render a table
        result = ':metal: Promise\n';
        result += constructReturnTable(typeArg);
      } else if (typeArg.type === consts.returnTypeReference) {
        result = ':metal: Promise';
        result += '<self>';
      }
      return result;
    });
    return returnTypes.join('<br>');
  }
}

/**
 * Gets method () block next to the method name
 * e.g. (props: any, x: string)
 * @param parameters
 * @returns {string}
 */
export function renderMethodBracket(parameters): string {
  const params = _.map(parameters, (param) => {
    const paramType = _.isString(param.type) ? param.type : 'object';
    return `${param.name}: *\`${paramType}\`*`;
  });
  return `(${params.join(', ')})`;
}

/**
 * Get a source link such as
 * [ensemble/forest.ts:6](https://github.com/JasonShin/machinelearnjs/blob/master/src/lib/ensemble/forest.ts#L6)
 * @param sources
 * @returns {string}
 */
export function renderSourceLink(sources): string {
  if (_.isEmpty(sources)) {
    return '';
  }
  const defined = _.map(sources, (src) => {
    return `[${src.fileName}:${src.line}](${pjson.repository.url}/blob/master/src/lib/${src.fileName}#L${src.line})`;
  });
  return defined.join(',');
}

/**
 * Renders a new line
 * @returns {string}
 */
export function renderNewLine(): string {
  return '\n';
}

/**
 * Clean the string for hyperlink usage
 * @param {string} str
 * @returns {string}
 */
export function cleanHyperLink(str: string): string {
  if (_.isEmpty(str)) {
    throw new TypeError('Should not clean values other than strings');
  }
  // 1. Cloning the original str
  let newStr = _.clone(str);
  // 2. Replacing the known strings
  newStr = _.replace(newStr, '_', '-');
  // 3. apply lowercase transformation
  return newStr.toLowerCase();
}

Handlebars.registerHelper('ifEquals', (children, x, y, options) => ifEquals(children, x, y, options));

Handlebars.registerHelper('isSignatureValid', (context, options) => isSignatureValid(context, options));

Handlebars.registerHelper('filterConstructor', (children, options) => {
  return filterByKind(children, options, consts.kindNumberConstructor);
});

Handlebars.registerHelper('filterMethod', (children, options) => {
  return filterByKind(children, options, consts.kindNumberMethod);
});

Handlebars.registerHelper('filterProperty', (children, options) => {
  return filterByKind(children, options, consts.kindNumberProperty);
});

Handlebars.registerHelper('filterTagExample', (children, options) =>
  filterByTag(children, options, consts.tagTypeExample),
);

Handlebars.registerHelper('constructParamTable', (parameters) => constructParamTable(parameters));

Handlebars.registerHelper('renderMethodReturnType', (type) => renderMethodReturnType(type));

Handlebars.registerHelper('methodBracket', (parameters) => renderMethodBracket(parameters));

Handlebars.registerHelper('getSourceLink', (sources) => renderSourceLink(sources));

Handlebars.registerHelper('newLine', renderNewLine);

Handlebars.registerHelper('cleanHyperLink', (str) => cleanHyperLink(str));

Handlebars.registerHelper('json', (json) => JSON.stringify(json));

// Processors
const apiProcessor = new APIProcessor();
apiProcessor.run(Handlebars);

const pagesProcessor = new PagesProcessor();
pagesProcessor.run();

const exampleProcessor = new ExampleProcessor();
exampleProcessor.run(Handlebars);

const configProcessor = new ConfigProcessor();

configProcessor.run({ apiChildren: apiProcessor.apiChildren });

const redirectProcessor = new RedirectProcessor();
redirectProcessor.run();
