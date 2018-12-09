import * as tf from '@tensorflow/tfjs';
import { countBy, zip } from 'lodash';
import { IMlModel, Type1DMatrix, Type2DMatrix } from '../types';
import math from '../utils/MathExtra';

const { isMatrix } = math.contrib;

interface IModelState<T> {
  classCategories: tf.Tensor1D;
  multinomialDist: tf.Tensor2D;
  priorProbability: tf.Tensor1D;
}

/**
 * Multinomial naive bayes machine learning algorithm
 *
 * The Naive is an intuitive method that uses probabilistic of each attribute
 * being in each class to make a prediction. It uses multinomial function to estimate
 * probability of a given class.
 *
 * @example
 * import { MultinomialNB } from 'kalimdor/naive_bayes';
 *
 * const nb = new MultinomialNB();
 * const X = [[1, 20], [2, 21], [3, 22], [4, 22]];
 * const y = [1, 0, 1, 0];
 * nb.fit({ X, y });
 * nb.predict({ X: [[1, 20]] }); // returns [ 1 ]
 *
 */
export class MultinomialNB<T extends number | string = number>
  implements IMlModel<T> {
  private classCategories: tf.Tensor1D;
  private multinomialDist: tf.Tensor2D;
  private priorProbability: tf.Tensor1D;

  /**
   *  Setting alpha=1 is called Laplace smoothing, while alpha<1 is called Lidstone smoothing.
   *
   * @param  {number=1} alpha
   */
  constructor(private readonly alpha: number = 1) {}

  /**
   * Fit date to build Gaussian Distribution summary
   *
   * @param  {Type2DMatrix<number>} X - training values
   * @param  {ReadonlyArray<T>} y - target values
   * @returns void
   */
  public fit(X: Type2DMatrix<number>, y: Type1DMatrix<T>): void {
    if (!isMatrix(X)) {
      throw new Error('X must be a matrix');
    }
    if (!Array.isArray(y)) {
      throw new Error('y must be a vector');
    }
    if (X.length !== y.length) {
      throw new Error('X and y must be same in length');
    }
    try {
      const {
        classCategories,
        multinomialDist,
        priorProbability
      } = this.fitModel(X, y);
      this.classCategories = classCategories;
      this.multinomialDist = multinomialDist;
      this.priorProbability = priorProbability;
    } catch (e) {
      throw e;
    }
  }

  /**
   * Predict multiple rows
   *
   * @param  {Type2DMatrix<number>} X - values to predict in Matrix format
   * @returns T
   */
  public predict(X: Type2DMatrix<number>): Type1DMatrix<T> {
    try {
      return X.map((x): T => this.singlePredict(x));
    } catch (e) {
      if (!isMatrix(X)) {
        throw new Error('X must be a matrix');
      } else {
        throw e;
      }
    }
  }

  /**
   * @param  {IterableIterator<IterableIterator<number>>} X
   * @returns IterableIterator
   */
  public *predictIterator(
    X: IterableIterator<IterableIterator<number>>
  ): IterableIterator<T> {
    for (const x of X) {
      yield this.singlePredict([...x]);
    }
  }

  /**
   * Returns a model checkpoint
   *
   * @returns InterfaceFitModelAsArray
   */
  public toJSON(): {
    classCategories: Type1DMatrix<number>,
    multinomialDist: Type2DMatrix<number>,
    priorProbability: Type1DMatrix<number>
  } {
    return {
      classCategories: this.classCategories,
      priorProbability: [
        ...this.priorProbability.clone().dataSync()
      ],
      multinomialDist: [...this.multinomialDist.clone().dataSync()]
    };
  }

  /**
   * @param  {InterfaceFitModelAsArray<T>} modelState
   * @returns void
   */
  public fromJSON(modelState: {
    multinomialDist: number[][];
    priorProbability: number[];
    classCategories: number[];
  }): void {
    const len: number = modelState.multinomialDist.length;
    this.classCategories = tf.tensor1d(modelState.classCategories);
    this.priorProbability = tf.tensor1d(modelState.priorProbability)
    this.multinomialDist = tf.tensor2d(modelState.multinomialDist as number[], [
      len / 2,
      2
    ]);
  }

  /**
   * Make a prediction
   *
   * @param  {ReadonlyArray<number>} predictRow
   * @returns T
   */
  private singlePredict(predictRow: Type1DMatrix<number>): Type1DMatrix<T>[any] {
    const matrixX: tf.Tensor<tf.Rank> = tf.tensor1d(
      predictRow as number[],
      'float32'
    );
    const numFeatures = matrixX.shape[0];
    const summaryLength = this.multinomialDist.shape[1];

    // Comparing input and summary shapes
    if (numFeatures !== summaryLength) {
      throw new Error(
        `Prediction input ${
          matrixX.shape[0]
        } length must be equal or less than summary length ${summaryLength}`
      );
    }
    const priorProbability = this.priorProbability.clone();

    // log is important to use different multinomial formula instead of the factorial formula
    // The multinomial naive Bayes classifier becomes a linear
    // classifier when expressed in log-space
    // const priorProbability = Math.log(1 / classCount);
    const fitProbabilites = this.multinomialDist.clone().mul(matrixX);

    // sum(1) is summing columns
    const allProbabilities = fitProbabilites.sum(1).add(priorProbability);

    const selectionIndex = allProbabilities.argMax().dataSync()[0];
    allProbabilities.dispose();

    return this.classCategories[selectionIndex];
  }

  /**
   * Summarise the dataset per class
   *
   * @param  {Type2DMatrix<number>} X - input distribution
   * @param  {ReadonlyArray<T>} y - classes to train
   * @returns IModelState
   */
  private fitModel(
    X: Type2DMatrix<number>,
    y: ReadonlyArray<T>
  ): {

  } {
    const classCounts = countBy<T>(y);
    const classCategories = Array.from(new Set(y));
    const numFeatures = X[0].length;
    const separatedByCategory = zip<ReadonlyArray<number>, T>(X, y).reduce(
      (groups, [row, category]) => {
        if (!(category.toString() in groups)) {
          groups[category.toString()] = [];
        }
        groups[category.toString()].push(
          tf.tensor1d(row as number[], 'float32')
        );

        return groups;
      },
      {}
    );
    console.log('sep cls', separatedByCategory['1']);
    const frequencySumByClass = tf.stack(
      classCategories.map(
        (category: T) =>
          tf.addN(separatedByCategory[category.toString()])
      )
    );

    const productReducedRow = Array.from(frequencySumByClass.sum(1).dataSync());
    console.log('product rows', productReducedRow);
    console.log('checking map', classCategories.map(c => classCounts[c.toString()] / y.length));
    // A class's prior may be calculated by assuming equiprobable classes
    // (i.e., priors = (number of samples in the class) / (total number of samples))
    const priorProbability: tf.Tensor1D = tf
      .tensor1d(
        classCategories.map(c => classCounts[c.toString()] / y.length),
        'float32'
      )
      .log();
    // log transform to use linear multinomial forumla
    const multinomialDist = frequencySumByClass
      .add(tf.scalar(this.alpha))
      .div(
        tf
          .tensor2d(
            productReducedRow as number[],
            [frequencySumByClass.shape[0], 1],
            'float32'
          )
          .add(tf.scalar(numFeatures * this.alpha))
      )
      .log();
    return {
      classCategories,
      multinomialDist,
      priorProbability
    };
  }
}
