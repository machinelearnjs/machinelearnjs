import { filterByKind, ifEquals } from '../../docs/processor';

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
    const result = ifEquals({}, 1, 1, optionsMock);
    expect(result).toBe(true);
  });

  it('should return inverse when the inputs are 1 and 2', () => {
    const result = ifEquals({}, 1, 2, optionsMock);
    expect(result).toBe(false);
  });

  it('should return fn when the two input objects are same', () => {
    const result = ifEquals({}, { z: 1 }, { z: 1 }, optionsMock);
    expect(result).toBe(true);
  });

  it('should return inverse when the two input objects are not same', () => {
    const result = ifEquals({}, { z: 1 }, { z: 2 }, optionsMock);
    expect(result).toBe(false);
  });
});

describe('docs:helper:filterByKind', () => {
  const fakePayload = [
    {
      id: 724,
      name: 'epochs',
      kind: 32,
      kindString: 'Variable',
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
    {
      id: 723,
      name: 'learning_rate',
      kind: 32,
      kindString: 'Variable',
      flags: {},
      comment: {
        shortText: 'model learning rate'
      },
      sources: [
        {
          fileName: 'linear_model/stochastic_gradient.ts',
          line: 122,
          character: 17
        }
      ],
      type: {
        type: 'intrinsic',
        name: 'number'
      }
    },
    {
      id: 726,
      name: 'random_state',
      kind: 32,
      kindString: 'Variable',
      flags: {},
      comment: {
        shortText: 'Number used to set a static random state'
      },
      sources: [
        {
          fileName: 'linear_model/stochastic_gradient.ts',
          line: 134,
          character: 16
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
