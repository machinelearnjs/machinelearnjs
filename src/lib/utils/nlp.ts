import { isString } from 'lodash';

/**
 * @ignore
 */
export class WordTokenizer {
  /**
   * Tokenize a given text
   * e.g.
   * given: "deep-learning ian good fellow learning jason shin shin"
   * returns: [ 'deep', 'learning', 'ian', 'good', 'fellow', 'learning', 'jason', 'shin', 'shin' ]
   * @param text
   * @returns {string[]}
   */
  public tokenize(text): string[] {
    if (!isString(text)) {
      throw new Error('Cannot process a non string value');
    }
    const regex = /[^A-Za-zА-Яа-я0-9_]+/g;
    return text.split(regex);
  }
}
