/* tslint:disable */
import { SVC, SVR } from './classes';

console.log('running xor example');

async function svcTest() {
  console.log('inside svctest');
  const svc2 = await SVC.create();
  const X = [[0, 0], [1, 1], [1, 0], [0, 1]];
  const y = [0, 0, 1, 1];

  const err = await svc2.fit({ X: X, y: y });
  console.log('result ', err);
  try {
    console.log('svc2 pred ', svc2.predict([[-0.8, -1]]));
  } catch (e) {
    console.log('err', e);
  }
}

svcTest().then(() => console.log('svc2 test finished'));

async function xor() {
  const svc = await SVC.create();
  const features = [[0, 0], [1, 1]];
  const labels = [0, 1];
  await svc.fit({ X: features, y: labels });
  console.log('SVC predict result', svc.predictOne([2, 2]));
}

xor().then(() => console.log('finished SVC'));

async function xor2() {
  const svr = await SVR.create();
  const features = [[0, 0], [2, 2]];
  const labels = [0.5, 2.5];
  await svr.fit({ X: features, y: labels });
  console.log('SVR predict result', svr.predict([[1, 1]]));
}

xor2().then(() => console.log('finished SVR'));
