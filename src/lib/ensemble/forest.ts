import * as _ from 'lodash';
import { DecisionTreeClassifier } from "../tree/tree";

export class RandomForestClassifier {
	private trees = [];
	private y = null;
	public fit({ X, y }) {
		this.y = y;
		for (let i = 0; i < 5; i++) {
			const tree = new DecisionTreeClassifier({ featureLabels: null, randomise: true });
			tree.fit({ X, y });
			this.trees.push(tree);
		}
	}
	public predict(X) {
		let predictions = _.map(this.trees, (tree) => {
			return tree.predict({ X });
		});
		return this.baggingPrediction(predictions);
	}

	private baggingPrediction(predictions: Array<any>) {
		const counts = _.countBy(predictions, x => x);
		const countsArray = _.reduce(_.keys(counts), (sum, key) => {
			let returning = {};
			returning[key] = counts[key];
			return _.concat(sum, returning);
		}, []);
		const max = _.maxBy(countsArray, (x) => _.head(_.values(x)));
		const key = _.head(_.keys(max));
		// Returning bagging pred result
		return _.split(key, ',');
	}
}