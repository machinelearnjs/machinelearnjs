/* tslint:disable */

import { DecisionTreeClassifier, Question } from "./tree";

const decision = new DecisionTreeClassifier();

const X = [
    ['Green', 3],
    ['Yellow', 3],
    ['Red', 1],
    ['Red', 1],
    ['Yellow', 3],
];

const y = ['Apple', 'Apple', 'Grape', 'Grape', 'Lemon'];

// Class counts
const counts = decision.classCounts(y);
console.log('checking counts', counts);

const features = ["color", "diameter", "label"]

// Testing questions
const q = new Question(features, 1, 3);

console.log('' + q);

const q2 = new Question(features, 0, 'Green');

console.log('' + q2);

const example = X[1];

console.log(q.match(example));

// Testing Decision tree

// 1 partition
const partResult = decision.partition(X, new Question(features, 0, 'Red'));
console.log(partResult);
