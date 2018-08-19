import { SGDClassifier, SGDRegressor } from "../../src/lib/linear_model/stochastic_gradient";

const X1 = [[0, 0], [1, 1]];
const y1 = [0, 1];

describe('linear_model:SGDClassifier', () => {
  const expected1 = [ 1 ]; // expected with less training
  const expected2 = [ 2 ]; // expected with more training
  it('should solve xor with default (50) epochs', () => {
    const clf = new SGDClassifier();
    clf.fit({ X: X1, y: y1 });
    const result = clf.predict({ X: [[2, 2]] });
    expect(result).toEqual([ 0 ]);
  });
  it('should solve xor with 30 epochs', () => {
    const clf = new SGDClassifier({ epochs: 30 });
    clf.fit({ X: X1, y: y1 });
    const result = clf.predict({ X: [[2, 2]] });
    expect(result).toEqual(expected1);
  });
  it('should solve xor with 150 epochs', () => {
    const clf = new SGDClassifier({ epochs: 150 });
    clf.fit({ X: X1, y: y1 });
    const result = clf.predict({ X: [[2, 2]] });
    expect(result).toEqual(expected2);
  });
  it('should solve xor with 10000 epochs', () => {
    const clf = new SGDClassifier({ epochs: 10000 });
    clf.fit({ X: X1, y: y1 });
    const result = clf.predict({ X: [[2, 2]] });
    expect(result).toEqual(expected2);
  });
  it('Should throw exceptions on fit with invalid inputs', () => {
    const clf = new SGDClassifier();

    // X
    expect(() => clf.fit({ X: null, y: y1 })).toThrow('X must be a matrix');
    expect(() => clf.fit({ X: 1, y: y1 })).toThrow('X must be a matrix');
    expect(() => clf.fit({ X: 'test', y: y1 })).toThrow('X must be a matrix');

    // y
    expect(() => clf.fit({ X: X1, y: null })).toThrow('y must be a vector');
    expect(() => clf.fit({ X: X1, y: 1 })).toThrow('y must be a vector');
    expect(() => clf.fit({ X: X1, y: 'test' })).toThrow('y must be a vector');
  });

  it('Should throw exceptions on predict with invalid inputs', () => {
    const clf = new SGDClassifier();
    // X
    expect(() => clf.predict({ X: null })).toThrow('X must be a vector');
    expect(() => clf.predict({ X: 1 })).toThrow('X must be a vector');
    expect(() => clf.predict({ X: {} })).toThrow('X must be a vector');
  });
});

describe('linear_model:SGDRegressor', () => {
  const expected1 = [0.2314227830387089];
  it('should solve xor with default (50) epochs', () => {
    const reg = new SGDRegressor();
    reg.fit({ X: X1, y: y1 });
    const result = reg.predict({ X: [[2, 2]] });
    expect(result).toEqual(expected1);
  });
  it('Should throw exceptions on fit with invalid inputs', () => {
    const clf = new SGDRegressor();

    // X
    expect(() => clf.fit({ X: null, y: y1 })).toThrow('X must be a matrix');
    expect(() => clf.fit({ X: 1, y: y1 })).toThrow('X must be a matrix');
    expect(() => clf.fit({ X: 'test', y: y1 })).toThrow('X must be a matrix');

    // y
    expect(() => clf.fit({ X: X1, y: null })).toThrow('y must be a vector');
    expect(() => clf.fit({ X: X1, y: 1 })).toThrow('y must be a vector');
    expect(() => clf.fit({ X: X1, y: 'test' })).toThrow('y must be a vector');
  });

  it('Should throw exceptions on predict with invalid inputs', () => {
    const clf = new SGDRegressor();
    // X
    expect(() => clf.predict({ X: null })).toThrow('X must be a vector');
    expect(() => clf.predict({ X: 1 })).toThrow('X must be a vector');
    expect(() => clf.predict({ X: {} })).toThrow('X must be a vector');
  });
});
