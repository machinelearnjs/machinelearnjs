import * as fs from 'fs';
import * as path from 'path';
import {
  filterByKind,
  filterByTag,
  ifEquals,
  searchInterface
} from '../../docs/processor';
const docsJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, './docs.json'), 'utf8')
);
/**
 * Mocking handlebar options
 */
const optionsMock = {
  fn: x => ({
    result: true,
    payload: x
  }),
  inverse: x => ({
    result: false,
    payload: x
  })
};

describe('docs:helper:ifEquals', () => {
  it('should return fn when the inputs are 1 and 1', () => {
    const result = ifEquals({}, 1, 1, optionsMock).result;
    expect(result).toBe(true);
  });

  it('should return inverse when the inputs are 1 and 2', () => {
    const result = ifEquals({}, 1, 2, optionsMock).result;
    expect(result).toBe(false);
  });

  it('should return fn when the two input objects are same', () => {
    const result = ifEquals({}, { z: 1 }, { z: 1 }, optionsMock).result;
    expect(result).toBe(true);
  });

  it('should return inverse when the two input objects are not same', () => {
    const result = ifEquals({}, { z: 1 }, { z: 2 }, optionsMock).result;
    expect(result).toBe(false);
  });
});

describe('docs:helper:filterByKind', () => {
  const fakePayload = [
    // Constructor
    {
      id: 724,
      name: 'zzzz',
      kind: 32,
      kindString: 'Constructor',
      flags: {},
      comment: {
        shortText: 'model training epochs'
      },
      sources: [
        {
          fileName: 'linear_model/stochastic_gradient.ts',
          line: 126,
          character: 10
        }
      ],
      type: {
        type: 'intrinsic',
        name: 'number'
      }
    },
    // Public var
    {
      id: 725,
      name: 'weights',
      kind: 32,
      kindString: 'Variable',
      flags: {
        isPublic: true
      },
      comment: {
        shortText: 'Model training weights'
      },
      sources: [
        {
          fileName: 'linear_model/stochastic_gradient.ts',
          line: 130,
          character: 11
        }
      ],
      type: {
        type: 'array',
        elementType: {
          type: 'intrinsic',
          name: 'number'
        }
      }
    }
  ];
  it('should filter all public Variables', () => {
    const result = filterByKind(fakePayload, optionsMock, 'Variable');
    expect(result).toMatchSnapshot();
  });

  it('should filter all constructor', () => {
    const result = filterByKind(fakePayload, optionsMock, 'Constructor');
    expect(result).toMatchSnapshot();
  });
});

describe('docs:helper:filterByTag', () => {
  const fakePayload = [
    {
      tag: 'example',
      text:
        "\nimport { SGDRegressor } from 'kalimdor/linear_model';\nconst reg = new SGDRegressor();\nconst X = [[0., 0.], [1., 1.]];\nconst y = [0, 1];\nreg.fit(X, y);\nreg.predict([[2., 2.]]); // result: [ 1.281828588248001 ]\n\n"
    },
    {
      tag: 'test',
      text: 'yo'
    }
  ];
  it('should find a tag example', () => {
    const result = filterByTag(fakePayload, optionsMock, 'example');
    expect(result).toMatchSnapshot();
  });

  it('should not find a tag zz', () => {
    const result = filterByTag(fakePayload, optionsMock, 'zz');
    expect(result.result).toBe(false);
  });
});

describe('docs:helper:searchInterface', () => {
  it('should find reference', () => {
    const result = searchInterface(docsJson, 920);
    const { id, name, kindString } = result;
    expect(id).toBe(920);
    expect(name).toBe('SVMOptions');
    expect(kindString).toBe('Interface');
  });
  it('should invalid ID reference return null', () => {
    const result = searchInterface(docsJson, 9999999);
    expect(result).toBe(null);
  });
});
