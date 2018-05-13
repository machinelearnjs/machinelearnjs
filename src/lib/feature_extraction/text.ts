import * as _ from 'lodash';
import * as sw from 'stopword';
import * as natural from 'natural';
import { ENGLISH_STOP_WORDS } from "./stop_words";

export class CountVectorizer {
	private vocabulary: object = {};
	constructor() {

	}

	public fit(doc: Array<string>) {
		const analyze = this.buildAnalyzer();
		// Build vocabulary
		const featureCounted = _.reduce(doc, (sum: any, value) => {
				const tokens = analyze(value);
				return _.reduce(tokens, (innerSum: any, token) => {
					const count = _.get(innerSum, token);
					if (count) {
						const newCount = count + 1;
						return _.set(innerSum, token, newCount);
					} else {
						return _.set(innerSum, token, 1);
					}
				}, sum);
		}, {});
		console.log('checking feature counted!', featureCounted);
	}

	public fit_transform() {

	}

	public transform() {

	}

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