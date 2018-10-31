/* tslint:disable */
import { RandomForestClassifier } from './forest';
import { Iris } from '../datasets/Iris';

(async function() {
  const irisDataset = new Iris();
  const { data, targets } = await irisDataset.load();

  const X = [[0, 0], [1, 1], [2, 1], [1, 5], [3, 2]];
  const y = [0, 1, 2, 3, 7];

  const randomForest = new RandomForestClassifier();
  randomForest.fit(X, y);

  console.log(randomForest.predict([[0, 3], [2, 1]]));

  const rf2 = new RandomForestClassifier();
  rf2.fit(data, targets);

  console.log('pred', rf2.predict([[6.7, 3, 5.2, 2.3]]));
})();
