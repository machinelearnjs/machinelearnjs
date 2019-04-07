import * as _ from 'lodash';
import { Imputer } from '../../src/lib/preprocessing/Imputer';
import { ValidationError, ValidationInconsistentShape } from '../../src/lib/utils/Errors';

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
    const testX = [[2, 3], [1, 1, null], [2, 3, 1]];
    const imp = new Imputer({ missingValues: null, axis: 0 });
    try {
      imp.fit(testX);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationInconsistentShape);
    }
  });

  it('fitting invalid data type should throw an error', () => {
    // String
    try {
      new Imputer({ missingValues: null, axis: 0 }).fit('asofjasof' as any);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
    }

    // Int
    try {
      new Imputer({ missingValues: null, axis: 0 }).fit(123 as any);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
    }

    // Boolean
    try {
      new Imputer({ missingValues: null, axis: 0 }).fit(true as any);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
    }

    // Null
    try {
      new Imputer({ missingValues: null, axis: 0 }).fit(null);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
    }

    // undefined
    try {
      new Imputer({ missingValues: null, axis: 0 }).fit(undefined);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
    }
  });
});
