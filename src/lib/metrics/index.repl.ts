/* tslint:disable */

import { accuracyScore, zeroOneLoss, confusion_matrix } from './classification';

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

const matrix1 = confusion_matrix({
  y_true: [1, 2, 3],
  y_pred: [1, 2, 3]
});
console.log(matrix1);

const matrix2 = confusion_matrix({
  y_true: [2, 0, 2, 2, 0, 1],
  y_pred: [0, 0, 2, 2, 0, 2]
});
console.log(matrix2);

const matrix3 = confusion_matrix({
  y_true: ['cat', 'ant', 'cat', 'cat', 'ant', 'bird'],
  y_pred: ['ant', 'ant', 'cat', 'cat', 'ant', 'cat']
});

console.log(matrix3);
