import { isEqual } from 'lodash';
import { ValidationError } from '../../src/lib/utils/Errors';
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
    const { tokenize } = tokenizer;
    try {
      tokenize(null);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
    }
    try {
      tokenize(1);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
    }
    try {
      tokenize(NaN);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
    }
    try {
      tokenize([]);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
    }
  });
});
