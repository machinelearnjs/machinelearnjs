import * as _ from 'lodash';
import { ValidationError } from './Errors';

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
    if (!_.isString(text)) {
      throw new ValidationError('Cannot process a non string value');
    }
    const regex = /[^A-Za-zА-Яа-я0-9_]+/g;
    return text.split(regex);
  }
}
