import * as _ from 'lodash';
import seedrandom from 'seedrandom';
import { isNumber } from 'util';
import { Type1DMatrix } from '../types';

/**
 * instance of RandomState
 * @ignore
 */
export interface RandomStateObj {
  next(): number;
  shuffle(array: Type1DMatrix<any>): Type1DMatrix<any>;
  rangedInt(min: number, max: number): number;
  choice(
    choiceArray: number | Type1DMatrix<any>,
    outputSize: number,
    probability?: Type1DMatrix<number>,
  ): Type1DMatrix<any>;
  permutation(num: number): Type1DMatrix<number>;
  rangedReal(min: number, max: number): number;
  real(min: number, max: number): (() => number);
}

/**
 * All of Random works lie here
 * @ignore
 */
export default class RandomState implements RandomStateObj {
  private random;
  constructor(seed: string | number = Math.random()) {
    this.random = seedrandom(seed.toString());
  }

  next(): number {
    return this.random();
  }

  rangedInt(min: number, max: number): number {
    return min + Math.floor((max - min) * this.next());
  }

  rangedReal(min: number, max: number): number {
    return min + (max - min) * this.next();
  }

  real(min: number, max: number): (() => number) {
    const diff = max - min;
    return () => min + diff * this.next();
  }
  /**
   * shuffles 1D array in place
   * taken from https://github.com/TimothyGu/knuth-shuffle-seeded/blob/gh-pages/index.js
   *    var random = new RandomState(4);
   *    random.shuffle([1, 2, 3, 4, 5])
   *    random.shuffle([1, 2, 3, 4, 5])
   *    output-1: [5, 3, 4, 1, 2]
   *    output-2: [3, 4, 2, 5, 1]
   * @param array type: Type1DMatrix<any>
   * @returns shuffled array
   */
  shuffle(array: Type1DMatrix<any>): Type1DMatrix<any> {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      const randomIndex = Math.floor(this.next() * currentIndex--);

      // And swap it with the current element.
      const temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  pickRandomIndex(length: number, probability: Type1DMatrix<number>): number {
    const theFate: number = this.next();
    const indexToPick = Math.floor(theFate * length);
    if (probability && probability[indexToPick] > theFate) {
      return this.pickRandomIndex(length, probability);
    }
    return indexToPick;
  }

  choice(
    choiceArray: number | Type1DMatrix<any>,
    outputSize: number,
    probability?: Type1DMatrix<number>,
  ): Type1DMatrix<any> {
    if (isNumber(choiceArray)) {
      choiceArray = _.range(choiceArray);
    }

    const lenChoiceArray: number = choiceArray.length;

    const outPutArray: Type1DMatrix<any> = new Array(outputSize);
    for (let i = 0; i < outputSize; i++) {
      const index = this.pickRandomIndex(lenChoiceArray, probability);
      outPutArray.push(choiceArray[index]);
    }
    return outPutArray;
  }

  /**
   * generates an array with number and permutates it.
   *    const random = new RandomState(4);
   *    random.shuffle(5)
   *    random.shuffle(5)
   *    output-1: [4, 2, 3, 0, 1]
   *    output-2: [2, 3, 1, 4, 0]
   * @param num type: number
   * @returns shuffled array
   */
  permutation(num: number): Type1DMatrix<number> {
    return this.shuffle(
      Array(num)
        .fill(0)
        .map(Number.call, Number),
    );
  }
}
