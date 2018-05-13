import * as _ from 'lodash';
import * as sw from 'stopword';
import * as natural from 'natural';
import { ENGLISH_STOP_WORDS } from "./stop_words";

export class CountVectorizer {
	private vocabulary: Array<string>;
	public vocabulary_: object = {};
	constructor() {

	}

	/**
	 * Calculates list of vocabularies in the entire document and come up with
	 * vocab: index pairs
	 * @param doc
	 */
	private buildVocabulary(doc) {
		const analyze = this.buildAnalyzer();
		const processedDoc = _.flowRight(
			(d: Array<string>) => _.uniq(d),
			(d: Array<string>) => _.sortBy(d, z => z),
			(d: Array<string>) => _.flatten(d),
			d =>  _.map(d, (text) => analyze(text))
		)(doc);
		const vocabulary_ = _.reduce(processedDoc, (sum, val, index) => {
			return _.set(sum, val, index);
		}, {});
		return {
			vocabulary_,
			vocabulary: processedDoc
		};
	}

	/**
	 * Counting number of vocab occurences in the current token of a sentence
	 * ['yoshua', 'bengio', 'deep', 'learning'] = vocabulary
	 * ['yohua', 'bengio'] => tokens
	 * results in
	 * [1, 1, 0, 0]
	 * @param doc
	 */
	private countVocab(doc) {
		const analyze = this.buildAnalyzer();
		// 1. Reducing the doc
		return _.reduce(doc, (sum: any, text) => {
			const tokens = analyze(text);

			// 2. Looping each vocab for counting
			const sentenceCounted = _.reduce(this.vocabulary, (sum: any, vocab) => {
				// 3. Getting number of occurences of vocab in each tokens (tokens of a sentence)
				const vocabCount = _.reduce(tokens, (sum: number, t) => {
					return _.isEqual(t, vocab) ? ++sum : sum;
				}, 0);
				return _.concat(sum, [vocabCount]);
			}, []);
			return _.concat(sum, [sentenceCounted]);
		}, []);
	}

	public fit(doc: Array<string>) {
		this.fit_transform(doc);
		return this;
	}

	public fit_transform(doc: Array<string>) {
		// Automatically assig
		const { vocabulary, vocabulary_ } = this.buildVocabulary(doc);
		this.vocabulary_ = vocabulary_;
		this.vocabulary = vocabulary;
		return this.countVocab(doc);
	}

	/**
	 * Dynamically transforms a doc on demand
	 * @param {Array<string>} doc
	 * @returns {number[][]}
	 */
	public transform(doc: Array<string>) {
		return this.countVocab(doc);
	}

	/**
	 * preprocess a line of text by applying
	 * 1) tokenization
	 * 2) removing stopwords
	 * @param text
	 * @param {any} removeSW
	 * @returns {any}
	 */
	private preprocess(text, {removeSW = false}) {
		const tokenizer = new natural.WordTokenizer();
		return _.flowRight(
			(x: string) => tokenizer.tokenize(x),
			(x: Array<string>) => x.join(' '),
			// TODO: Somehow it's removing too many words??!!
			(x: Array<string>) => removeSW ? sw.removeStopwords(x, ENGLISH_STOP_WORDS) : x,
			(x: string) => x.split(' ')
		)(text);
	}

	public buildAnalyzer() {
		return x => this.preprocess(x, { removeSW: true })
	}
}