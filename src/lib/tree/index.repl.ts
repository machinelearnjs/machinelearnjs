/* tslint:disable */

import { DecisionTreeClassifier, Question, classCounts } from './tree';

const features = ['color', 'diameter', 'label'];
const decision = new DecisionTreeClassifier({ featureLabels: features });

const X = [['Green', 3], ['Yellow', 3], ['Red', 1], ['Red', 1], ['Yellow', 3]];

const y = ['Apple', 'Apple', 'Grape', 'Grape', 'Lemon'];

// Class counts
const counts = classCounts(y);
console.log('checking counts', counts);


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
  greenPartition.trueY,
  greenPartition.falseY,
  currentUncertainty
);
console.log('Green partition infogain', greenInfo);

const redParition = decision.partition(X, y, new Question(features, 0, 'Red'));
const redInfo = decision.infoGain(
  redParition.trueY,
  redParition.falseY,
  currentUncertainty
);
console.log('Red parition infogain', redInfo);

// find best split
const bestSplit = decision.findBestSplit(X, y);
console.log(
  'bestSplit: ',
  bestSplit.bestQuestion.toString(),
  ' ',
  bestSplit.bestGain
);

const bestSplit2 = decision.findBestSplit2(X, y);

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
const predictResult2 = decision2.predictOne({ row: [2., 2.] });
console.log('checkehc',predictResult2);