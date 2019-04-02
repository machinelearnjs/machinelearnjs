import * as _ from 'lodash';
import * as sw from 'stopword';
import { Type1DMatrix } from '../types';
import { WordTokenizer } from '../utils/nlp';
import { validateMatrix1D } from '../utils/validation';
import { ENGLISH_STOP_WORDS } from './stop_words';

/**
 * The CountVectorizer provides a simple way to both tokenize a collection
 * of text documents and build a vocabulary of known words, but also
 * to encode new documents using that vocabulary.
 *
 * @example
 * import { CountVectorizer } from 'machinelearn/feature_extraction';
 *
 * const corpus = ['deep learning ian good fellow learning jason shin shin', 'yoshua bengio'];
 * const vocabCounts = cv.fit_transform(corpus);
 * console.log(vocabCounts); // [ [ 0, 1, 1, 1, 1, 1, 2, 2, 0 ], [ 1, 0, 0, 0, 0, 0, 0, 0, 1 ] ]
 * console.log(cv.vocabulary); // { bengio: 0, deep: 1, fellow: 2, good: 3, ian: 4, jason: 5, learning: 6, shin: 7, yoshua: 8 }
 * console.log(cv.getFeatureNames()); // [ 'bengio', 'deep', 'fellow', 'good', 'ian', 'jason', 'learning', 'shin', 'yoshua' ]
 *
 * const newVocabCounts = cv.transform(['ian good fellow jason duuog']);
 * console.log(newVocabCounts); // [ [ 0, 0, 1, 1, 1, 1, 0, 0, 0 ] ]
 */
export class CountVectorizer {
  public vocabulary: object = {};
  /** @ignore */
  private internalVocabulary: Type1DMatrix<string>;

  /**
   * Learn a vocabulary dictionary of all tokens in the raw documents.
   * @param {string[]} doc - An array of strings
   * @returns {CountVectorizer}
   */
  public fit(doc: Type1DMatrix<string> = null): this {
    validateMatrix1D(doc);
    this.fit_transform(doc);
    return this;
  }

  /**
   * fit transform applies
   * @param {string[]} doc - An array of strings
   * @returns {number[][]}
   */
  public fit_transform(doc: Type1DMatrix<string> = null): number[][] {
    validateMatrix1D(doc);
    const { internalVocabulary, pubVocabulary } = this.buildVocabulary(doc);
    this.vocabulary = pubVocabulary;
    this.internalVocabulary = internalVocabulary;
    return this.countVocab(doc);
  }

  /**
   * Transform documents to document-term matrix.
   * Extract token counts out of raw text documents using the vocabulary
   * fitted with fit or the one provided to the constructor.
   * @param {string[]} doc - An array of strings
   * @returns {number[][]}
   */
  public transform(doc: Type1DMatrix<string> = null): number[][] {
    validateMatrix1D(doc);
    return this.countVocab(doc);
  }

  /**
   * Array mapping from feature integer indices to feature name
   * @returns {Object}
   */
  public getFeatureNames(): object {
    if (!this.internalVocabulary) {
      throw new Error('You must fit a document first before you can retrieve the feature names!');
    }
    return this.internalVocabulary;
  }

  /**
   * Build a tokenizer/vectorizer
   * @returns {(x: string) => string[]}
   */
  private buildAnalyzer(): (x: string) => string[] {
    return (x) => this.preprocess(x, { removeSW: true });
  }

  /**
   * Calculates list of vocabularies in the entire document and come up with
   * vocab: index pairs
   * @param doc
   */
  private buildVocabulary(
    doc: Type1DMatrix<string>,
  ): {
    internalVocabulary: string[];
    pubVocabulary: object;
  } {
    const analyze = this.buildAnalyzer();
    const processedDoc: string[] = _.flowRight(
      (d: string[]) => _.uniq(d),
      (d: string[]) => _.sortBy(d, (z) => z),
      (d: string[][]) => _.flatten(d),
      (d: string[]) => _.map(d, (text) => analyze(text)),
    )(doc);
    const pubVocabulary = _.reduce(
      processedDoc,
      (sum, val, index) => {
        return _.set(sum, val, index);
      },
      {},
    );
    return {
      internalVocabulary: processedDoc,
      pubVocabulary,
    };
  }

  /**
   * @ignore
   * Counting number of vocab occurences in the current token of a sentence
   * ['yoshua', 'bengio', 'deep', 'learning'] = vocabulary
   * ['yohua', 'bengio'] => tokens
   * results in
   * [1, 1, 0, 0]
   * @param doc
   */
  private countVocab(doc: Type1DMatrix<string>): number[][] {
    const analyze = this.buildAnalyzer();
    const docVocabCounts: number[][] = [];
    for (const sentence of doc) {
      // For each sentence, get tokens
      const tokens: string[] = analyze(sentence);
      const sentenceCounts: number[] = [];

      // For each vocab, count number of appearance of each vocab in the tokens
      for (const vocab of this.internalVocabulary) {
        let vocabCount = 0;
        for (const t of tokens) {
          if (t === vocab) {
            vocabCount++;
          }
        }
        sentenceCounts.push(vocabCount);
      }
      docVocabCounts.push(sentenceCounts);
    }
    return docVocabCounts;
  }

  /**
   * @ignore
   * preprocess a line of text by applying
   * 1) tokenization
   * 2) removing stopwords
   * @param text
   * @param { boolean } removeSW
   * @returns {any}
   */
  private preprocess(text: string, { removeSW = false }): string[] {
    const tokenizer = new WordTokenizer();
    let tokens = text.split(' ');
    if (removeSW) {
      tokens = sw.removeStopwords(tokens, ENGLISH_STOP_WORDS);
    }
    return tokenizer.tokenize(tokens.join(' '));
  }
}
