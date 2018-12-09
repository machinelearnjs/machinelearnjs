/* tslint:disable */
import { inferShape, validateMatrixType } from './tensor_ops';

const result = inferShape([[1, 2]]);

console.log(result);

console.log(validateMatrixType([['z', 'z']], ['string']));
