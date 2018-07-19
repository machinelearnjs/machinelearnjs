/* tslint:disable */

import { DecisionTreeClassifier } from './tree';

const features = ['color', 'diameter', 'label'];
const decision = new DecisionTreeClassifier({ featureLabels: features });

const X = [['Green', 3], ['Yellow', 3], ['Red', 1], ['Red', 1], ['Yellow', 3]];

const y = ['Apple', 'Apple', 'Grape', 'Grape', 'Lemon'];
decision.fit({ X, y });
decision.printTree();

// predict
const predictResult = decision.predictOne({ row: X[0] });
console.log('predict result', predictResult);

const predictResults = decision.predict({ X });
console.log('predicted all results', predictResults);

const decision2 = new DecisionTreeClassifier({ featureLabels: null });

const X2 = [[0, 0], [1, 1]];
const Y2 = [0, 1];

decision2.fit({ X: X2, y: Y2 });
const predictResult2 = decision2.predictOne({ row: [2, 2] });
console.log('checking predict 2', predictResult2);
