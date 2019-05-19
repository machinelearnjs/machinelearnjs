/* tslint:disable */
import { SVC, SVR } from './classes';

const svc = new SVC();
svc.loadWASM().then((loadedSVC) => {
  const X = [[-1, -1], [-2, -1], [1, 1], [2, 1]];
  const y = [-1, 1, 2, 2];
  // TODO: fix where it checks !== -1
  loadedSVC.fit(X, y);
  console.log('svc pred: ', loadedSVC.predict([[-0.8, -1]]));

  const xorFeatures = [[0, 0], [1, 1]];
  const xorLabels = [0, 1];
  loadedSVC.fit(xorFeatures, xorLabels);
  console.log('SVC xor: ', loadedSVC.predict([[2, 2]]));
});

const svr = new SVR();
svr.loadWASM().then((loadedSVR) => {
  const features = [[0, 0], [2, 2]];
  const labels = [0.5, 2.5];
  loadedSVR.fit(features, labels);
  console.log('SVR predict result', loadedSVR.predict([[1, 1]]));
});
