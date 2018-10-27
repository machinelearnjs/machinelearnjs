import { Iris } from '../../src/lib/datasets';
import { SGDClassifier, SGDRegressor } from '../../src/lib/linear_model';
import { accuracyScore } from '../../src/lib/metrics';
import { train_test_split } from '../../src/lib/model_selection';
import { assertArrayAlmostEqual } from '../../src/lib/utils/testing';

const X1 = [[0, 0], [1, 1]];
const y1 = [0, 1];

describe('linear_model:SGDClassifier', () => {
  const expected1 = [2]; // expected with more training
  const accuracyExpected1 = 0.7;
  it('should solve xor with 100000 epochs', () => {
    const clf = new SGDClassifier({ epochs: 100000 });
    clf.fit(X1, y1);
    const result = clf.predict([[2, 2]]);
    expect(result).toEqual(expected1);
  });
  it('should solve iris with 10000 epochs and have greater than 70 accuracy', async () => {
    const iris = new Iris();
    const { data, targets } = await iris.load();
    const { xTest, xTrain, yTest, yTrain } = train_test_split({
      X: data,
      y: targets,
      test_size: 0.33,
      train_size: 0.67,
      random_state: 42
    });

    const clf = new SGDClassifier({
      epochs: 10000,
      learning_rate: 0.000001
    });
    clf.fit(xTrain, yTrain);
    const result = clf.predict(xTest);
    const accuracy = accuracyScore({
      y_pred: result,
      y_true: yTest
    });
    expect(accuracy).toBeGreaterThanOrEqual(accuracyExpected1);
  });
  it('Should throw exceptions on fit with invalid inputs', () => {
    const clf = new SGDClassifier();
    // X
    expect(() => clf.fit(null, y1)).toThrow('X must be a matrix');
    expect(() => clf.fit(1, y1)).toThrow('X must be a matrix');
    expect(() => clf.fit('test', y1)).toThrow('X must be a matrix');

    // y
    expect(() => clf.fit(X1, null)).toThrow('y must be a vector');
    expect(() => clf.fit(X1, 1)).toThrow('y must be a vector');
    expect(() => clf.fit(X1, 'test')).toThrow('y must be a vector');
  });

  it('Should throw exceptions on predict with invalid inputs', () => {
    const clf = new SGDClassifier();
    // X
    expect(() => clf.predict(null)).toThrow('X must be a vector');
    expect(() => clf.predict(1)).toThrow('X must be a vector');
    expect(() => clf.predict({})).toThrow('X must be a vector');
  });
});

describe('linear_model:SGDRegressor', () => {
  const expected1 = [
    -0.07334784418344498,
    1.8702806234359741,
    2.027863025665283,
    1.757415533065796,
    -0.058840565383434296,
    1.2708457708358765,
    1.4022281169891357,
    -0.12441510707139969,
    0.9141921401023865,
    0.9153953790664673,
    0.09964509308338165,
    -0.012327668257057667,
    0.8524127006530762,
    0.9993201494216919,
    0.05692737177014351,
    1.260292649269104,
    2.080444574356079,
    -0.009513204917311668,
    1.9556868076324463,
    1.4598970413208008,
    0.8319887518882751,
    2.089475631713867,
    -0.05327172577381134,
    2.0235347747802734,
    -0.0016155339544638991,
    1.2159310579299927,
    1.526334285736084,
    1.057511806488037,
    1.2104287147521973,
    1.7403795719146729,
    -0.13033176958560944,
    -0.025982998311519623,
    1.7425973415374756,
    1.8811771869659424,
    -0.08381890505552292,
    1.3183915615081787,
    -0.027015937492251396,
    -0.058081306517124176,
    1.6068274974822998,
    1.6342045068740845,
    1.2668280601501465,
    -0.07258858531713486,
    1.9060038328170776,
    1.5319108963012695,
    -0.06700124591588974,
    1.8551995754241943,
    1.1812701225280762,
    1.8531256914138794,
    -0.07763924449682236,
    1.150630235671997
  ];
  it('should solve xor with default (50) epochs', async () => {
    const iris = new Iris();
    const { data, targets } = await iris.load();
    const { xTest, xTrain, yTrain } = train_test_split({
      X: data,
      y: targets,
      test_size: 0.33,
      train_size: 0.67,
      random_state: 42
    });
    const reg = new SGDRegressor();
    reg.fit(xTrain, yTrain);
    const result = reg.predict(xTest);
    const similarity = assertArrayAlmostEqual(expected1, result, 1);
    expect(similarity).toBeGreaterThan(70);
  });
  it('Should throw exceptions on fit with invalid inputs', () => {
    const clf = new SGDRegressor();

    // X
    expect(() => clf.fit(null, y1)).toThrow('X must be a matrix');
    expect(() => clf.fit(1, y1)).toThrow('X must be a matrix');
    expect(() => clf.fit('test', y1)).toThrow('X must be a matrix');

    // y
    expect(() => clf.fit(X1, null)).toThrow('y must be a vector');
    expect(() => clf.fit(X1, 1)).toThrow('y must be a vector');
    expect(() => clf.fit(X1, 'test')).toThrow('y must be a vector');
  });

  it('Should throw exceptions on predict with invalid inputs', () => {
    const clf = new SGDRegressor();
    // X
    expect(() => clf.predict(null)).toThrow('X must be a vector');
    expect(() => clf.predict(1)).toThrow('X must be a vector');
    expect(() => clf.predict({})).toThrow('X must be a vector');
  });
});
