/* tslint:disable */

import { DecisionTreeClassifier, Question, classCounts } from './tree';

const decision = new DecisionTreeClassifier();

const X = [['Green', 3], ['Yellow', 3], ['Red', 1], ['Red', 1], ['Yellow', 3]];

const y = ['Apple', 'Apple', 'Grape', 'Grape', 'Lemon'];

// Class counts
const counts = classCounts(y);
console.log('checking counts', counts);

const features = ['color', 'diameter', 'label'];

// Testing questions
const q = new Question(features, 1, 3);

console.log('' + q);

const q2 = new Question(features, 0, 'Green');

console.log('' + q2);

const example = X[1];

console.log(q.match(example));

// Testing Decision tree

// 1 partition
const partResult = decision.partition(X, y, new Question(features, 0, 'Red'));
console.log(partResult);

// 2. gini
const gini = decision.gini(['Apple', 'Apple']);
console.log('checking consistent features', gini);

const giniSomeMix = decision.gini(['Apple', 'Orange']);
console.log('gini with some mixing', giniSomeMix);

// 3. InfoGain
const currentUncertainty = decision.gini(y);

// How much info do we gain from partitioning Green?
const greenPartition = decision.partition(
  X,
  y,
  new Question(features, 0, 'Green')
);
const greenInfo = decision.infoGain(
  greenPartition.trueRows,
  greenPartition.falseRows,
  currentUncertainty
);
console.log('Green partition infogain', greenInfo);

const redParition = decision.partition(X, y, new Question(features, 0, 'Red'));
const redInfo = decision.infoGain(
  redParition.trueRows,
  redParition.falseRows,
  currentUncertainty
);
console.log('Red parition infogain', redInfo);

// find best split
const bestSplit = decision.findBestSplit(X, y, features);
console.log(
  'bestSplit: ',
  bestSplit.bestQuestion.toString(),
  ' ',
  bestSplit.bestGain
);
