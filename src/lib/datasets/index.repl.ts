/* tslint:disable */
import { Iris } from './Iris';

const irisData = new Iris();
irisData.load().then(data => {
  const { description } = data;
  console.log('checking desc', description);
});
