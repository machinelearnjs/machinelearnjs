/* tslint:disable */

import { DecisionTreeClassifier, Question } from "./tree";

const decision = new DecisionTreeClassifier();

const trainingData = [
    ['Green', 3, 'Apple'],
    ['Yellow', 3, 'Apple'],
    ['Red', 1, 'Grape'],
    ['Red', 1, 'Grape'],
    ['Yellow', 3, 'Lemon'],
]

const features = ["color", "diameter", "label"]

// Testing questions
const q = new Question(features, 1, 3);

console.log('' + q);

const q2 = new Question(features, 0, 'Green');

console.log('' + q2);

const example = trainingData[1];

console.log(q.match(example));

// Testing Decision tree

// 1 partition
const partResult = decision.partition(trainingData, new Question(features, 0, 'Red'));
console.log(partResult);
