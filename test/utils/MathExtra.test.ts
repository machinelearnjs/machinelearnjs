import * as _ from 'lodash';
import math from '../../src/lib/utils/MathExtra';

describe('math.contrib.size', () => {
  it('should return correct x axis length', () => {
    const testX = [[1, 2, 3], [2, 3, 4]];
    const result = math.contrib.size(testX, 0);
    expect(result).toBe(2);
  });
  it('should return correct y axis length', () => {
    const testX = [[1, 2, 3], [2, 3, 4]];
    const result = math.contrib.size(testX, 1);
    expect(result).toBe(3);
  });
  it('should throw an error because X is null', () => {
    const testX = null;
    expect(() => {
      math.contrib.size(testX, 1);
    }).toThrow('Invalid input array of size 0!');
  });
  it('should throw an error because X is an empty array', () => {
    const testX = [];
    expect(() => {
      math.contrib.size(testX, 1);
    }).toThrow('Invalid input array of size 0!');
  });
  it('should throw an error because axis is invalid', () => {
    const testX = [[1, 2], [2, 3]];
    const axis = 12;
    expect(() => {
      math.contrib.size(testX, axis);
    }).toThrow(`Invalid axis value ${axis} was given`);
  });
});

describe('math.contrib.range', () => {
  it('should return [0, 1, 2, 3]', () => {
    const result = math.contrib.range(0, 4);
    const expected = [0, 1, 2, 3];
    expect(_.isEqual(result, expected)).toBe(true);
  });

  it('should return [-2, -1, 0, 1]', () => {
    const result = math.contrib.range(-2, 2);
    const expected = [-2, -1, 0, 1];
    expect(_.isEqual(result, expected)).toBe(true);
  });

  it('should throw an invalid error', () => {
    expect(() => math.contrib.range('test', 2)).toThrow(
      'start and stop arguments need to be numbers'
    );
  });
});
