/* tslint:disable */
import { LinearRegression } from './linear_regression';

const lr = new LinearRegression();

const X = [1, 2, 4, 3, 5];
const y = [1, 3, 3, 2, 5];

lr.fit({ X, y });

console.log(lr.predict([1, 2]));
