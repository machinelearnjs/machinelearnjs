import * as _ from 'lodash';
import * as natural from 'natural';
import * as sw from 'stopword';
import { ENGLISH_STOP_WORDS } from './stop_words';

export class CountVectorizer {
  public vocabulary: object = {};
  /** @ignore */
  private internalVocabulary: string[];

  /**
   * Learn a vocabulary dictionary of all tokens in the raw documents.
   * @param {string[]} doc - An array of strings
   * @returns {CountVectorizer}
   */
  public fit(doc: string[]): this {
    this.fit_transform(doc);
    return this;
  }

  /**
   * fit transform applies
   * @param {string[]} doc - An array of strings
   * @returns {number[][]}
   */
  public fit_transform(doc: string[]): number[] {
    // Automatically assig
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
  public transform(doc: string[]): number[] {
    return this.countVocab(doc);
  }

  /**
   * Array mapping from feature integer indices to feature name
   * @returns {Object}
   */
  public getFeatureNames(): object {
    if (!this.internalVocabulary) {
      throw new Error(
        'You must fit a document first before you can retrieve the feature names!'
      );
    }
    return this.internalVocabulary;
  }

  /**
   * Build a tokenizer/vectorizer
   * @returns {(x: string) => string[]}
   */
  public buildAnalyzer(): (x: string) => string[] {
    return x => this.preprocess(x, { removeSW: true });
  }

  /**
   * Calculates list of vocabularies in the entire document and come up with
   * vocab: index pairs
   * @param doc
   */
  private buildVocabulary(
    doc: string[]
  ): {
    internalVocabulary: string[];
    pubVocabulary: object;
  } {
    const analyze = this.buildAnalyzer();
    const processedDoc: string[] = _.flowRight(
      (d: string[]) => _.uniq(d),
      (d: string[]) => _.sortBy(d, z => z),
      (d: string[][]) => _.flatten(d),
      (d: string[]) => _.map(d, text => analyze(text))
    )(doc);
    const pubVocabulary = _.reduce(
      processedDoc,
      (sum, val, index) => {
        return _.set(sum, val, index);
      },
      {}
    );
    return {
      internalVocabulary: processedDoc,
      pubVocabulary
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
  private countVocab(doc: string[]): number[] {
    const analyze = this.buildAnalyzer();
    // 1. Reducing the doc
    return _.reduce(
      doc,
      (sum: any, text: string) => {
        const tokens = analyze(text);

        // 2. Looping each vocab for counting
        const sentenceCounted = _.reduce(
          this.internalVocabulary,
          (sentenceCounts: any, vocab) => {
            // 3. Getting number of occurences of vocab in each tokens (tokens of a sentence)
            const vocabCount = _.reduce(
              tokens,
              (tokenCounts: number, t) => {
                if (_.isEqual(t, vocab)) {
                  return tokenCounts + 1;
                } else {
                  return tokenCounts;
                }
              },
              0
            );
            return _.concat(sentenceCounts, [vocabCount]);
          },
          []
        );
        return _.concat(sum, [sentenceCounted]);
      },
      []
    );
  }

  /**
   * @ignore
   * preprocess a line of text by applying
   * 1) tokenization
   * 2) removing stopwords
   * @param text
   * @param {any} removeSW
   * @returns {any}
   */
  private preprocess(text: string, { removeSW = false }): string[] {
    const tokenizer = new natural.WordTokenizer();
    return _.flowRight(
      (x: string) => tokenizer.tokenize(x),
      (x: string[]) => x.join(' '),
      // TODO: Somehow it's removing too many words??!!
      (x: string[]) =>
        removeSW ? sw.removeStopwords(x, ENGLISH_STOP_WORDS) : x,
      (x: string) => x.split(' ')
    )(text);
  }
}
