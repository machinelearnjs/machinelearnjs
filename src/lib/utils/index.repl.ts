/* tslint:disable */
import { inferShape } from './tensors';
import { validateMatrixType } from './validation';

const result = inferShape([[1, 2]]);

console.log(result);

console.log(validateMatrixType([['z', 'z']], ['string']));
