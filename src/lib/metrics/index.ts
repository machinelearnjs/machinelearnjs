/* tslint:disable */
import * as ConfusionMatrix from 'ml-confusion-matrix';

/**
 * Reference: http://www.dataschool.io/simple-guide-to-confusion-matrix-terminology/
 * Official API Doc: https://mljs.github.io/confusion-matrix/
 * @param yTrue
 * @param yPred
 */
export const confusion_matrix = ConfusionMatrix;

// const trueLabels =      [0, 1, 0, 1, 1, 0];
const trueLabels = [[0, 1, 1], [1, 0, 0]];
const predictedLabels = [1, 1, 1, 1, 0, 0];

const cm2 = new confusion_matrix([[13, 2], [10, 5]], ['cheese', 'dog']);

console.log('acc', cm2.getAccuracy());
console.log(cm2.getFalseCount());
console.log(cm2.getIndex('dog'));

import { accuracyScore, zeroOneLoss } from './classification';

const accResult = accuracyScore({
  y_true: [0, 1, 2, 3],
  y_pred: [0, 2, 1, 3]
});

console.log('accuracy result ', accResult);

const accResultNorm = accuracyScore({
  y_true: [0, 1, 2, 3],
  y_pred: [0, 2, 1, 3],
  normalize: false
});

console.log('accuracy result iwht norm false ', accResultNorm);

const loss_zero_one_result = zeroOneLoss({
  y_true: [1, 2, 3, 4],
  y_pred: [2, 2, 3, 5]
});

console.log('loss zero one ', loss_zero_one_result);
