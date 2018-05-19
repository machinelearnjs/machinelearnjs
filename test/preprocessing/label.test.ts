import * as _ from 'lodash';
import { LabelEncoder } from '../../src/lib/preprocessing/label';

describe('Label', () => {
  it('string labels test', () => {
    const le = new LabelEncoder();
    const labelX = ['amsterdam', 'paris', 'tokyo'];
    le.fit(labelX);
    const transformX = ['tokyo', 'tokyo', 'paris'];
    const result = le.transform(transformX);
    const expected = [2, 2, 1];
    expect(_.isEqual(result, expected)).toBe(true);
  });

  it('number labels test', () => {
    const le = new LabelEncoder();
    const labelX = [1, 2, 3, 4];
    le.fit(labelX);
    const transformX = [2, 2, 2, 3];
    const result = le.transform(transformX);
    const expected = [1, 1, 1, 2];
    expect(_.isEqual(result, expected)).toBe(true);
  });

  it('boolean labels test', () => {
    const le = new LabelEncoder();
    const labelX = [true, false];
    le.fit(labelX);
    const transformX = [true, true, true, false];
    const result = le.transform(transformX);
    const expected = [0, 0, 0, 1];
    expect(_.isEqual(result, expected)).toBe(true);
  });
});
