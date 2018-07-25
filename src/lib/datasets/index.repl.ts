/* tslint:disable */
import { Iris } from './Iris';

const irisData = new Iris();
irisData.load();
console.log('checking iris', irisData.data);
