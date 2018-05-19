/* tslint:disable */
import { SVC } from './classes';

console.log('running xor example');

async function xor() {
  const svc = new SVC();
  const features = [[0, 0], [1, 1]];
  const labels = [0, 1];
  await svc.fit({ X: features, y: labels });
  console.log('pred result', svc.predict([2., 2.]));
}

xor().then(() => console.log('done!zzzz'));
