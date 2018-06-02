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

	public fit() {

	}
}
