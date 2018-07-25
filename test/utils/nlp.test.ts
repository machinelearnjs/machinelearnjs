import { isEqual } from 'lodash';
import { WordTokenizer } from '../../src/lib/utils/nlp';

describe('nlp:WordTokenizer', () => {
  const tokenizer = new WordTokenizer();
  const text1 = 'deep learning ian good fellow learning jason shin shin';
  it('should tokenize text1', () => {
    const expected = ['deep', 'learning', 'ian', 'good', 'fellow', 'learning', 'jason', 'shin', 'shin'];
    const result = tokenizer.tokenize(text1);
    expect(isEqual(expected, result)).toBe(true);
  });
  it('should not tokenize a non string value', () => {
    const expectedError = 'Cannot process a non string value';
    const { tokenize } = tokenizer;
    expect(() => tokenize(null)).toThrow(expectedError);
    expect(() => tokenize(1)).toThrow(expectedError);
    expect(() => tokenize(NaN)).toThrow(expectedError);
    expect(() => tokenize([])).toThrow(expectedError);
  });
});
