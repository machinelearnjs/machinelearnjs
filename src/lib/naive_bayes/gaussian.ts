import { cloneDeep, isNaN } from 'lodash';
import { exp, mean, pi, pow, sqrt, std } from 'mathjs';
import { validateFitInputs, validateMatrix2D } from '../ops';
import { Type1DMatrix, Type2DMatrix } from '../types';

/**
 * The Naive is an intuitive method that uses probabilistic of each attribute
 * belonged to each class to make a prediction. It uses Gaussian function to estimate
 * probability of a given class.
 *
 * @example
 * import { GaussianNB } from 'kalimdor/naive_bayes';
 *
 * const nb = new GaussianNB();
 * const X = [[1, 20], [2, 21], [3, 22], [4, 22]];
 * const y = [1, 0, 1, 0];
 * nb.fit({ X, y });
 * nb.predict({ X: [[1, 20]] }); // returns [ 1 ]
 *
 */
export class GaussianNB {
  /**
   * Naive Bayes summary according to classes
   */
  private summaries = null;

  /**
   * To clone input values
   */
  private clone = true;

  /**
   * @param clone - To clone the input values during fit and predict
   */
  constructor(
    {
      clone = true
    }: {
      clone: boolean;
    } = {
      clone: true
    }
  ) {
    this.clone = clone;
  }

  /**
   * Fit date to build Gaussian Distribution summary
   * @param X - training values
   * @param y - target values
   */
  public fit(
    X: Type2DMatrix<string | number | boolean> = [],
    y: Type1DMatrix<string | number | boolean> = []
  ): void {
    validateFitInputs(X, y);
    let clonedX = X;
    let clonedY = y;
    if (this.clone) {
      clonedX = cloneDeep(X);
      clonedY = cloneDeep(y);
    }
    this.summaries = this.summarizeByClass({ X: clonedX, y: clonedY });
  }

  /**
   * Predict multiple rows
   * @param {any[]} X - values to predict in Matrix format
   * @returns {number[]}
   */
  public predict(X: Type2DMatrix<number> = []): number[] {
    validateMatrix2D(X);
    let clonedX = X;

    if (this.clone) {
      clonedX = cloneDeep(X);
    }
    const result = [];
    for (let i = 0; i < clonedX.length; i++) {
      result.push(this.singlePredict(clonedX[i]));
    }
    return result;
  }

  /**
   * Restores GaussianNB model from a checkpoint
   * @param summaries - Gaussian Distribution summaries
   */
  public fromJSON(
    {
      summaries = null
    }: {
      summaries: {};
    } = {
      summaries: null
    }
  ): void {
    this.summaries = summaries;
  }

  /**
   * Returns a model checkpoint
   */
  public toJSON(): {
    summaries: {};
  } {
    return {
      summaries: this.summaries
    };
  }

  /**
   * Make a prediction
   * @param X -
   */
  private singlePredict(X: Type1DMatrix<number>): number {
    const summaryKeys = Object.keys(this.summaries);
    // Comparing input and summary shapes
    const summaryLength = this.summaries[summaryKeys[0]].dist.length;
    const inputLength = X.length;
    if (inputLength > summaryLength) {
      throw new Error(
        'Prediction input X length must be equal or less than summary length'
      );
    }

    // Getting probability of each class
    const probabilities = {};
    for (let i = 0; i < summaryKeys.length; i++) {
      const key = summaryKeys[i];
      probabilities[key] = 1;
      const classSummary = this.summaries[key].dist;
      for (let j = 0; j < classSummary.length; j++) {
        const meanval = classSummary[j][0];
        const stdev = classSummary[j][1];
        const x = X[j];
        const probability = this.calculateProbability({ x, meanval, stdev });
        if (!isNaN(probability)) {
          probabilities[key] *= probability;
        }
      }
    }

    // Vote the best predction
    let bestProb = 0;
    let bestClass = null;
    const probKeys = Object.keys(probabilities);
    for (let i = 0; i < probKeys.length; i++) {
      const key = probKeys[i];
      const prob = probabilities[key];
      if (prob > bestProb) {
        bestProb = prob;
        // Returns the real class value
        bestClass = this.summaries[key].class;
      }
    }
    return bestClass;
  }

  /**
   * Calculate the main division
   * @param x
   * @param meanval
   * @param stdev
   */
  private calculateProbability({
    x,
    meanval,
    stdev
  }: {
    x: number;
    meanval: number;
    stdev: number;
  }): number {
    const stdevPow: any = pow(stdev, 2);
    const meanValPow: any = -pow(x - meanval, 2);
    const exponent = exp(meanValPow / (2 * stdevPow));
    return (1 / (sqrt(pi.valueOf() * 2) * stdev)) * exponent;
  }

  /**
   * Summarise the dataset per class using "probability density function"
   * example:
   * Given
   * const X = [[1,20], [2,21], [3,22], [4,22]];
   * const y = [1, 0, 1, 0];
   * Returns
   * { '0': [ [ 3, 1.4142135623730951 ], [ 21.5, 0.7071067811865476 ] ],
   * '1': [ [ 2, 1.4142135623730951 ], [ 21, 1.4142135623730951 ] ] }
   * @param dataset
   */
  private summarizeByClass({ X, y }): {} {
    const separated = this.separateByClass({ X, y });
    const summarize = {};
    const keys = Object.keys(separated);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      // tslint:disable-next-line
      const targetClass = y.find(z => z == key); // Finding the real target value from y array
      // Mutating "separated" variable instead of immutable approach for performance
      separated[key].forEach(x => x.push(targetClass));
      const dataset = separated[key];
      // storing object to each attribute to store real class value and dist sumamry
      summarize[key] = {
        class: targetClass,
        dist: this.summarize(dataset)
      };
    }
    return summarize;
  }

  /**
   * Summarise the dataset to calculate the ‘pdf’ (probability density function) later on
   * @param dataset
   */
  private summarize(dataset): number[] {
    const sorted = [];
    // Manual ZIP; simulating Python's zip(*data)
    // TODO: Find a way to use a built in function
    for (let zRow = 0; zRow < dataset.length; zRow++) {
      const row = dataset[zRow];
      for (let zCol = 0; zCol < row.length; zCol++) {
        // Pushes a new array placeholder if it's not populated yet at zRow index
        if (typeof sorted[zCol] === 'undefined') {
          sorted.push([]);
        }
        const element = dataset[zRow][zCol];
        sorted[zCol].push(element);
      }
    }

    const summaries = [];
    for (let i = 0; i < sorted.length; i++) {
      const attributes: any = sorted[i];
      summaries.push([mean(attributes), std(attributes)]);
    }
    // Removing the last element
    summaries.pop();
    return summaries;
  }

  /**
   * Separates X by classes specified by y argument
   * @param X
   * @param y
   */
  private separateByClass({ X, y }): {} {
    const result = {};
    for (let i = 0; i < X.length; i++) {
      const row = X[i];
      const target = y[i];
      if (result[target]) {
        // If value already exist
        result[target].push(row);
      } else {
        result[target] = [];
        result[target].push(row);
      }
    }
    return result;
  }
}
