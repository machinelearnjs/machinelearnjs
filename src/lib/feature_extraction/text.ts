import * as _ from 'lodash';
import * as sw from 'stopword';
import * as natural from 'natural';
import { ENGLISH_STOP_WORDS } from "./stop_words";

export class CountVectorizer {
	constructor() {

	}

	public fit() {

	}

	public fit_transform() {

	}

	public transform() {

	}

	private preprocess(text) {
		const tokenizer = new natural.WordTokenizer();
		return _.flowRight(
			(x: Array<string>) => _.uniq(x),
			(x: string) => tokenizer.tokenize(x),
			(x: Array<string>) => x.join(' '),
			(x: Array<string>) => sw.removeStopwords(x, ENGLISH_STOP_WORDS),
			(x: string) => x.split(' ')
		)(text);
	}

	public buildAnalyzer() {
		return x => this.preprocess(x)
	}
}