import {
  LinearRegression
} from './base'

const lr = new LinearRegression();

const X = [0.5, 1, 1.5, 2, 2.5];
const y = [0, 1, 2, 3, 4];

lr.fit({ X, y });
console.log('checking pred X:', lr.predict(3));
