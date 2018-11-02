/* tslint:disable */

import { DecisionTreeClassifier } from './tree';
import { Iris } from '../datasets';

(async function() {
  const features = ['color', 'diameter', 'label'];
  const decision = new DecisionTreeClassifier({ featureLabels: features });

  const X = [
    ['Green', 3],
    ['Yellow', 3],
    ['Red', 1],
    ['Red', 1],
    ['Yellow', 3]
  ];

  const y = ['Apple', 'Apple', 'Grape', 'Grape', 'Lemon'];
  decision.fit(X, y);
  decision.printTree();

  // predict
  const predictResult = decision.predict([['Green', 3]]);
  console.log('predict result', predictResult);

  const predictResults = decision.predict(X);
  console.log('predicted all results', predictResults);

  const decision2 = new DecisionTreeClassifier({ featureLabels: null });

  const X2 = [[0, 0], [1, 1]];
  const y2 = [0, 1];

  decision2.fit(X2, y2);
  const predictResult2 = decision2.predict([[0, 1]]);
  console.log('checking predict 2', predictResult2);

  const iris = new Iris();
  const { data, targets } = await iris.load();

  const decision3 = new DecisionTreeClassifier();
  decision3.fit(data, targets);

  console.log('checking the result');
  console.log(decision3.predict([[5.9, 3, 5.1, 1.8]]));
})();
