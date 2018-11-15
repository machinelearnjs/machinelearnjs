/* tslint:disable */

/*
import { LinearRegression } from './linear_regression';

const lr = new LinearRegression();

const X = [1, 2, 4, 3, 5];
const y = [1, 3, 3, 2, 5];

lr.fit(X, y);

console.log(lr.predict([1, 2]));

import { SGDClassifier, SGDRegressor } from './stochastic_gradient';

const sgd = new SGDClassifier();
const X1 = [
  [7, 0.27, 0.36, 20.7, 0.045, 45, 170, 1.001, 3, 0.45, 8.8],
  [6.3, 0.3, 0.34, 1.6, 0.049, 14, 132, 0.994, 3.3, 0.49, 9.5],
  [8.1, 0.28, 0.4, 6.9, 0.05, 30, 97, 0.9951, 3.26, 0.44, 10.1],
  [7.2, 0.23, 0.32, 8.5, 0.058, 47, 186, 0.9956, 3.19, 0.4, 9.9],
  [7.2, 0.23, 0.32, 8.5, 0.058, 47, 186, 0.9956, 3.19, 0.4, 9.9]
];

const y1 = [1, 2, 3, 4, 5];

sgd.fit(X1, y1);
const result = sgd.predict([
  [7, 0.27, 0.36, 20.7, 0.045, 45, 170, 1.001, 3, 0.45, 8.8],
  [8.1, 0.28, 0.4, 6.9, 0.05, 30, 97, 0.9951, 3.26, 0.44, 10.1],
  [7.2, 0.23, 0.32, 8.5, 0.058, 47, 186, 0.9956, 3.19, 0.4, 9.9],
  [7.2, 0.23, 0.32, 8.5, 0.058, 47, 186, 0.9956, 3.19, 0.4, 9.9]
]);

console.log('checking res', result);
const reg = new SGDRegressor();
const X2 = [[0, 0], [1, 1]];
const y2 = [0, 1];
reg.fit(X2, y2);
console.log(reg.predict([[2, 2]]));

console.log('checking res', result);
const clf = new SGDClassifier();
const X3 = [[0, 0], [1, 1]];
const y3 = [0, 1];
clf.fit(X3, y3);
console.log(clf.predict([[2, 2]]));
import { Ridge } from './coordinate_descent';

const rr = new Ridge({
  l2: 10
});
rr.fit(X1, y1);
const result2 = rr.predict([
  [7, 0.27, 0.36, 20.7, 0.045, 45, 170, 1.001, 3, 0.45, 8.8],
  [8.1, 0.28, 0.4, 6.9, 0.05, 30, 97, 0.9951, 3.26, 0.44, 10.1],
  [7.2, 0.23, 0.32, 8.5, 0.058, 47, 186, 0.9956, 3.19, 0.4, 9.9],
  [7.2, 0.23, 0.32, 8.5, 0.058, 47, 186, 0.9956, 3.19, 0.4, 9.9]
]);

console.log('checking res', result2);
*/
import { Lasso } from './coordinate_descent';

const reg1 = new Lasso({ degree: 2, l1: 1 });
reg1.fit([[0, 0], [1, 1]], [0, 1]);
console.log('lasso', reg1.predict([[1, 1]]));
