import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import * as _ from 'lodash';
import * as path from 'path';
import { APIProcessor } from './APIProcessor';
import config from './config';
import { ConfigProcessor } from './ConfigProcessor';
import * as consts from './const';
import { PagesProcessor } from './PagesProcessor';
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
function ifEquals(children, x, y, options): any {
  return _.isEqual(x, y) ? options.fn(children) : options.inverse(children);
}

/**
 * Filters children by a kind name such as Constructor or Method
 * @param children
 * @param options
 * @param kind
 * @returns {any}
 */
function filterByKind(children, options, kind): any {
  if (children) {
    const filtered = children.filter(child => {
      return child.kindString === kind;
    });
    // Filtering by isProtected = true and any constructors (we always want to display constructors
    const publicFiltered = filtered.filter(filteredChild => {
      return filteredChild.flags.isPublic || filteredChild.kindString === consts.kindStringConst;
    });
    return _.isEmpty(publicFiltered) ? options.inverse(children) : options.fn(publicFiltered);
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
function filterByTag(children, options, tag): any {
  if (children) {
    const filtered = children.filter(child => {
      return child.tag === tag;
    });
    return _.isEmpty(filtered) ? options.inverse(children) : options.fn(filtered);
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
function searchInterface(docs, id): any {
  let candidate = null;
  _.forEach(docs.children, module => {
    _.forEach(module.children, entity => {
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
function isSignatureValid(context, options): any {
  const signatures = context.signatures;
  if (_.isEmpty(signatures) || !signatures) {
    return options.inverse(context);
  }

  const firstSignature = _.first(signatures);
  const firstSignatureParams = _.get(firstSignature, 'parameters');
  if (_.isEmpty(firstSignatureParams) || !firstSignatureParams) {
    return options.inverse(context);
  }

  // Otherwise returns true
  return options.fn(context);
}

/**
 * Constructs a parameter table that may look something like:
 * | Param | Type | Default | Description |
 * | ------ | ------ | ------ | ------ |
 * | _namedParameters.X | any |  | array-like or sparse matrix of shape &#x3D; [nsamples, n_features]
 * | _namedParameters.y | any |  | array-like, shape &#x3D; [nsamples] or [n_samples, n_outputs]
 *
 * @param parameters
 * @returns {string}
 */
function constructParamTable(parameters): string {
  // Param table characters blacklist
  const paramTableCharsBlackList = [/\n/g, /\r\n/g, '_'];

  /**
   * Prioritise getting text instead of shortText description
   * @param param
   */
  const getText = param => {
    const text = _.get(param, 'comment.text');
    const shortText = _.get(param, 'comment.shortText');
    if (text) {
      return text;
    } else if (shortText) {
      return shortText;
    }
    return undefined;
  };

  /**
   * Generic clean function before displaying it on the table parameters
   * @param text
   * @returns {string}
   */
  const cleanTableText = text => {
    const blacklistCleaned = _.reduce(
      paramTableCharsBlackList,
      (result, rmChar) => {
        return _.replace(result, rmChar, '');
      },
      text
    );
    return _.trim(blacklistCleaned);
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
        _.forEach(param.type.declaration.children, namedParam => {
          sum.push([
            `${param.name}.${namedParam.name}`,
            namedParam.type.name,
            namedParam.defaultValue,
            getText(namedParam)
          ]);
        });
      } else if (consts.paramTypeIntrinsic === paramType) {
        //  2. Handle any intrintic params
        // e.g. x: number
        sum.push([param.name, param.type.name, param.defaultValue, getText(param)]);
      } else if (consts.paramTypeArray === paramType) {
        // 3. Handle any array params
        // e.g. string[]
        sum.push([param.name, param.type.name, param.defaultValue, getText(param)]);
      } else if (consts.paramTypeReference === paramType) {
        // 4. Handle any Interface params
        // e.g. x: Options
        const foundRef = searchInterface(docsJson, param.type.id);
        _.forEach(foundRef.children, prop => {
          sum.push([`${param.name}.${prop.name}`, prop.type.name, prop.defaultValue, getText(prop)]);
        });
      }
      return sum;
    },
    []
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
 * Renders method return type
 * @param type
 * @returns {string}
 */
function renderMethodReturnType(type): string {
  if (type.type === consts.returnTypeIntrinsic) {
    return type.name;
  } else if (type.type === consts.returnTypeArray) {
    return `${type.elementType.name}[]`;
  }
}

/**
 * Gets method () block next to the method name
 * e.g. (props: any, x: string)
 * @param parameters
 * @returns {string}
 */
function renderMethodBracket(parameters): string {
  const params = _.map(parameters, param => {
    const paramType = _.isString(param.type) ? param.type : 'object';
    return `${param.name}: *\`${paramType}\`*`;
  });
  return `(${params.join(', ')})`;
}

/**
 * Get a source link such as
 * [ensemble/forest.ts:6](https://github.com/JasonShin/kalimdorjs/blob/master/src/lib/ensemble/forest.ts#L6)
 * @param sources
 * @returns {string}
 */
function renderSourceLink(sources): string {
  const defined = _.map(sources, src => {
    return `[${src.fileName}:${src.line}](${pjson.repository.url}/blob/master/src/lib/${src.fileName}#L${src.line})`;
  });
  return defined.join(',');
}

/**
 * Renders a new line
 * @returns {string}
 */
function renderNewLine(): string {
  return '\n';
}

Handlebars.registerHelper('ifEquals', (children, x, y, options) => ifEquals(children, x, y, options));

Handlebars.registerHelper('isSignatureValid', (context, options) => isSignatureValid(context, options));

Handlebars.registerHelper('filterConstructor', (children, options) =>
  filterByKind(children, options, consts.kindStringConst)
);

Handlebars.registerHelper('filterMethod', (children, options) =>
  filterByKind(children, options, consts.kindStringMethod)
);

Handlebars.registerHelper('filterProperty', (children, options) =>
  filterByKind(children, options, consts.kindStringProperty)
);

Handlebars.registerHelper('filterTagExample', (children, options) =>
  filterByTag(children, options, consts.tagTypeExample)
);

Handlebars.registerHelper('constructParamTable', parameters => constructParamTable(parameters));

Handlebars.registerHelper('renderMethodReturnType', type => renderMethodReturnType(type));

Handlebars.registerHelper('methodBracket', parameters => renderMethodBracket(parameters));

Handlebars.registerHelper('getSourceLink', sources => renderSourceLink(sources));

Handlebars.registerHelper('newLine', renderNewLine);

// Processors
const apiProcessor = new APIProcessor();
apiProcessor.run(Handlebars);

const pagesProcessor = new PagesProcessor({ defaultREADME: config.defaultREADME });
pagesProcessor.run();

const configProcessor = new ConfigProcessor();
configProcessor.run({ apiChildren: apiProcessor.apiChildren });
