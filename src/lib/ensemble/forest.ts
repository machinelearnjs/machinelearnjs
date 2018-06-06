import { DecisionTreeClassifier } from "../tree/tree";

export class RandomForestClassifier {
	public fit({ X, y }) {
		let predictions = [];
		for (let i = 0; i < 5; i++) {
			const tree = new DecisionTreeClassifier({ featureLabels: null, randomise: true });
			tree.fit({ X, y });
			predictions.push(tree.predict({ X }));
		}
		console.log('preds', predictions);
	}
	public predict(X) {

	}
}