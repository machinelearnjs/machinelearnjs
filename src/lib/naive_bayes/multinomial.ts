import * as tfc from '@tensorflow/tfjs';
import { countBy, zip } from 'lodash';
import { IMlModel, Type2DMatrix } from '../types';
import math from '../utils/MathExtra';

const { isMatrix } = math.contrib;

interface InterfaceFitModel<T> {
  classCategories: ReadonlyArray<T>;
  multinomialDist: tfc.Tensor<tfc.Rank>; // 2D matrix
  priorProbability: tfc.Tensor<tfc.Rank.R1>;
}

interface InterfaceFitModelAsArray<T> {
  classCategories: ReadonlyArray<T>;
  multinomialDist: ReadonlyArray<number>;
  priorProbability: ReadonlyArray<number>;
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
  private _modelState: InterfaceFitModel<T>;

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
  public fit(X: Type2DMatrix<number>, y: ReadonlyArray<T>): void {
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
      this._modelState = this.fitModel(X, y);
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
  public predict(X: Type2DMatrix<number>): T[] {
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
  public toJSON(): InterfaceFitModelAsArray<T> {
    this._modelState.multinomialDist.print();
    this._modelState.priorProbability.print();
    return {
      classCategories: this._modelState.classCategories,
      priorProbability: [
        ...this._modelState.priorProbability.clone().dataSync()
      ],
      multinomialDist: [...this._modelState.multinomialDist.clone().dataSync()]
    };
  }

  /**
   * @param  {InterfaceFitModelAsArray<T>} modelState
   * @returns void
   */
  public fromJSON(modelState: InterfaceFitModelAsArray<T>): void {
    const len: number = modelState.multinomialDist.length;
    this._modelState = {
      classCategories: modelState.classCategories,
      priorProbability: tfc.tensor1d(modelState.priorProbability as number[]),
      multinomialDist: tfc.tensor2d(modelState.multinomialDist as number[], [
        len / 2,
        2
      ])
    };
  }

  /**
   * Make a prediction
   *
   * @param  {ReadonlyArray<number>} predictRow
   * @returns T
   */
  private singlePredict(predictRow: ReadonlyArray<number>): T {
    const matrixX: tfc.Tensor<tfc.Rank> = tfc.tensor1d(
      predictRow as number[],
      'float32'
    );
    const numFeatures = matrixX.shape[0];
    const summaryLength = this._modelState.multinomialDist.shape[1];

    // Comparing input and summary shapes
    if (numFeatures !== summaryLength) {
      throw new Error(
        `Prediction input ${
          matrixX.shape[0]
        } length must be equal or less than summary length ${summaryLength}`
      );
    }
    const priorProbability = this._modelState.priorProbability.clone();

    // log is important to use different multinomial formula instead of the factorial formula
    // The multinomial naive Bayes classifier becomes a linear
    // classifier when expressed in log-space
    // const priorProbability = Math.log(1 / classCount);
    const fitProbabilites = this._modelState.multinomialDist
      .clone()
      .mul(matrixX);

    // sum(1) is summing columns
    const allProbabilities = fitProbabilites.sum(1).add(priorProbability);

    const selectionIndex = allProbabilities.argMax().dataSync()[0];
    allProbabilities.dispose();

    return this._modelState.classCategories[selectionIndex];
  }

  /**
   * Summarise the dataset per class
   *
   * @param  {Type2DMatrix<number>} X - input distribution
   * @param  {ReadonlyArray<T>} y - classes to train
   * @returns InterfaceFitModel
   */
  private fitModel(
    X: Type2DMatrix<number>,
    y: ReadonlyArray<T>
  ): InterfaceFitModel<T> {
    const classCounts = countBy<T>(y);

    const classCategories: ReadonlyArray<T> = [...new Set(y)];
    const numFeatures = X[0].length;

    const separatedByCategory: {
      [id: string]: Array<tfc.Tensor<tfc.Rank.R2>>;
    } = zip<ReadonlyArray<number>, T>(X, y).reduce(
      (groups, [row, category]) => {
        if (!(category.toString() in groups)) {
          groups[category.toString()] = [];
        }
        groups[category.toString()].push(
          tfc.tensor1d(row as number[], 'float32')
        );

        return groups;
      },
      {}
    );

    const productReducedRow = [];
    const frequencyCount: tfc.Tensor = tfc.stack(
      classCategories.map(
        (category: T): tfc.Tensor<tfc.Rank.R2> => {
          const addedRows = tfc.addN(separatedByCategory[category.toString()]);
          const rowsArray = [...addedRows.dataSync()];
          productReducedRow.push(rowsArray.reduce((s, c) => s + c, 0));
          return addedRows;
        }
      )
    );

    // A class's prior may be calculated by assuming equiprobable classes
    // (i.e., priors = (number of samples in the class) / (total number of samples))
    const priorProbability: tfc.Tensor<tfc.Rank.R1> = tfc
      .tensor1d(
        classCategories.map(c => classCounts[c.toString()] / y.length),
        'float32'
      )
      .log();

    // log transform to use linear multinomial forumla
    const multinomialDist: tfc.Tensor = frequencyCount
      .add(tfc.scalar(this.alpha) as tfc.Tensor)
      .div(
        tfc
          .tensor2d(
            productReducedRow as number[],
            [frequencyCount.shape[0], 1],
            'float32'
          )
          .add(tfc.scalar(numFeatures * this.alpha))
      )
      .log();

    return {
      classCategories,
      multinomialDist,
      priorProbability
    };
  }
}
