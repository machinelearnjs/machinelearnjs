/* tslint:disable */

/*
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
*/

import { accuracyScore } from '../metrics';
import { train_test_split } from '../model_selection';
import { AdaboostClassifier } from './weight_boosting';
import { MinMaxScaler } from '../preprocessing';
import { Iris } from '../datasets/Iris';

(async function() {
  const irisDataset = new Iris();
  const { data, targets } = await irisDataset.load();
  const { xTest, xTrain, yTest, yTrain } = train_test_split(data, targets);

  const clf = new AdaboostClassifier({ n_cls: 1000 });

  const minmaxScaler = new MinMaxScaler({ featureRange: [0, 1] });
  const dataset = xTrain.map((x, i) => {
    x.push(yTrain[i]);
    return x;
  });
  minmaxScaler.fit(dataset);
  const newXtrain = xTrain.map(x => minmaxScaler.fit_transform(x));
  const newYtrain = minmaxScaler.fit_transform(yTrain);
  clf.fit(newXtrain, newYtrain);

  const newXtest = xTest.map(x => minmaxScaler.fit_transform(x));
  const yPred = minmaxScaler.inverse_transform(clf.predict(newXtest));

  const accuracy = accuracyScore(yTest, yPred);
  console.log('pred', accuracy);
})();
