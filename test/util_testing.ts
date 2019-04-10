import * as _ from 'lodash';

/**
 * Raises an AssertionError if two objects are not equal up to desired precision.
 * @param desired
 * @param actual
 * @param precision
 */
const assertArrayAlmostEqual = (desired: number[], actual: number[], precision: number = 6): number => {
  const results = [];
  for (let i = 0; i < desired.length; i++) {
    const d = desired[i];
    const a = actual[i];
    const calc = Math.abs(d - a) < 1.5 * Math.pow(10, -precision);
    results.push(calc);
  }
  const numTrues = results.reduce((sum, cur) => (cur ? sum + 1 : sum), 0);
  return numTrues / results.length * 100;
};

const matchExceptionWithSnapshot = (method: (...x) => any, args: any[]): void => {
  try {
    method(...args);
  } catch (e) {
    expect(e).toMatchSnapshot();
  }
};

export { assertArrayAlmostEqual, matchExceptionWithSnapshot };
