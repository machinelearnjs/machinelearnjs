import * as _ from 'lodash';
import { DecisionTreeClassifier } from "../tree/tree";

export class RandomForestClassifier {
	private trees = [];
	private nEstimator;

	constructor(props = { nEstimator: 10 }) {
		this.nEstimator = props.nEstimator;
	}

	/**
	 * Fit data and build list of trees
	 * @param {any} X
	 * @param {any} y
	 */
	public fit({ X, y }) {
		this.trees = _.reduce(_.range(0, this.nEstimator), (sum) => {
			const tree = new DecisionTreeClassifier({ featureLabels: null, randomise: true });
			tree.fit({ X, y });
			return _.concat(sum, [tree]);
		}, []);
		console.log('checking tres', this.trees.length);
	}

	/**
	 * Predict classification
	 * @param X
	 * @returns {string[]}
	 */
	public predict(X) {
		let predictions = _.map(this.trees, (tree) => {
			return tree.predict({ X });
		});
		return this.baggingPrediction(predictions);
	}

	/**
	 * Bagging prediction help method
	 * According to the predictions returns by the trees, it will select the
	 * class with the maximum number (votes)
	 * @param {Array<any>} predictions
	 * @returns {string[]}
	 */
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