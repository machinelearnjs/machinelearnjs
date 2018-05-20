/* tslint:disable */
import { SVC, SVR } from './classes';

console.log('running xor example');

async function xor() {
  const svc = new SVC();
  const features = [[0, 0], [1, 1]];
  const labels = [0, 1];
  await svc.fit({ X: features, y: labels });
  console.log('SVC predict result', svc.predict([2., 2.]));
}

xor().then(() => console.log('finished SVC'));

async function xor2() {
  const svr = new SVR();
  const features = [[0, 0], [2, 2]];
  const labels = [0.5, 2.5];
  await svr.fit({ X: features, y: labels });
  console.log('SVR predict result', svr.predict([1, 1]));
}

xor2().then(() => console.log('finished SVR'));
