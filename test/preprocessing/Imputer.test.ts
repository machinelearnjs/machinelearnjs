import * as _ from 'lodash';
import { Imputer } from '../../src/lib/preprocessing/Imputer';

describe('Imputer', () => {
  it('fit [[1, 2], [null, 3], [7, 6]] and transform [[null, 2], [6, null], [7, 6]]', () => {
    const expectedResult = [[4, 2], [6, 3.6666666666666665], [7, 6]];
    const testX = [[1, 2], [null, 3], [7, 6]];
    const imp = new Imputer({ missingValues: null, axis: 0 });
    imp.fit(testX);
    const result = imp.fit_transform([[null, 2], [6, null], [7, 6]]);
    expect(_.isEqual(result, expectedResult)).toBe(true);
  });

  it('fit data with dimensions mismatching', () => {
    const textX = [[2, 3], [1, 1, null], [2, 3, 1]];
    const imp = new Imputer({ missingValues: null, axis: 0 });
    expect(() => {
      imp.fit(textX);
      imp.fit_transform([[null, 2], [1, 2, 3], [null, 2, 1]]);
    }).toThrow('Dimension mismatch (3 != 2)');
  });

  it('fitting invalid data type should throw an error', () => {
    // String
    expect(() => {
      new Imputer({ missingValues: null, axis: 0 }).fit('asofjasof');
    }).toThrow('X is not an array!');

    // Int
    expect(() => {
      new Imputer({ missingValues: null, axis: 0 }).fit(123);
    }).toThrow('X is not an array!');

    // Boolean
    expect(() => {
      new Imputer({ missingValues: null, axis: 0 }).fit(true);
    }).toThrow('X is not an array!');

    // Null
    expect(() => {
      new Imputer({ missingValues: null, axis: 0 }).fit(null);
    }).toThrow('X is not an array!');

    // undefined
    expect(() => {
      new Imputer({ missingValues: null, axis: 0 }).fit(undefined);
    }).toThrow('Invalid input array of size 0!');
  });
});
