import { AssertionError } from '../src/lib/utils/Errors';

/**
 * Raises an AssertionError if two arrays are not equal up to desired precision.
 * @param desired
 * @param actual
 * @param precision
 */
const getAlmostEqualElemsCount = (desired: number[], actual: number[], precision: number = 6): number => {
  const results = [];
  for (let i = 0; i < desired.length; i++) {
    const d = desired[i];
    const a = actual[i];
    if (Number.isNaN(a) && Number.isNaN(d)) {
      results.push(true);
    } else {
      const calc = Math.abs(d - a) < 1.5 * Math.pow(10, -precision);
      results.push(calc);
    }
  }
  const numTrues = results.reduce((sum, cur) => (cur ? sum + 1 : sum), 0);

  return numTrues;
};

const assertArrayAlmostEqual = (desired: number[], actual: number[], precision: number = 6) => {
  if (desired.length !== actual.length) {
    throw new AssertionError('Desired and actual arrays should have the same length');
  }

  const numAlmostEqualElems = getAlmostEqualElemsCount(desired, actual, precision);

  if (numAlmostEqualElems < desired.length) {
    throw new AssertionError(`Expected ${desired.length} almost equal numbers, got ${numAlmostEqualElems}`);
  }
};

const matchExceptionWithSnapshot = (method: (...x) => any, args: any[]): void => {
  try {
    method(...args);
  } catch (e) {
    expect(e).toMatchSnapshot();
  }
};

export { assertArrayAlmostEqual, getAlmostEqualElemsCount, matchExceptionWithSnapshot };
