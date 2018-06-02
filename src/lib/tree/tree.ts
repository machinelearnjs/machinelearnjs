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
	public classCounts(targets) {
		// TODO: If targets is a multi-dimensional, automatically grab -1 index
		return _.reduce(targets, (accum, target) => {
			const count = _.get(accum, target);
			if (_.isNumber(count) && count > 0) {
				return _.set(accum, target, count + 1);
			} else {
				return _.set(accum, target, 1);
			}
		}, {});
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
