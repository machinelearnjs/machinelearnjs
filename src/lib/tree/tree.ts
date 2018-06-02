import * as _ from 'lodash';


export class Question {
	private features = [];
	private column = null;
	private value = null;

	constructor(features, column, value) {
		this.features = features;
		this.column = column;
		this.value = value;
	}

	public match(example) {
		const val = example[this.column];
		if (_.isNumber(val)) {
			return val >= this.value;
		} else {
			return val === this.value;
		}
	}

	public toString():string {
		const condition = _.isNumber(this.value) ? '>=' : '==';
		return `Is ${this.features[this.column]} ${condition} ${this.value}`;
	}
}

export class DecisionTreeClassifier {
	public classCounts(rows) {
		_.reduce(rows, (accum, val) => {
			const count = _.get(accum, val);
			if (count && count > 0) {
				return _.set(accum, val, count + 1);
			} else {
				return _.set(accum, val, 0);
			}
		}, {})
	}

	public partition(rows, question: Question) {
		let trueRows = [];
		let falseRows = [];
		_.forEach(rows, (row) => {
			if (question.match(row)) {
				trueRows.push(row);
			} else {
				falseRows.push(row);
			}
		});

		return { trueRows, falseRows };
	}

	public gini() {

	}

	public fit() {

	}
}
