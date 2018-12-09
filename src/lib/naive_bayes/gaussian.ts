import * as tfc from '@tensorflow/tfjs';
import { zip } from 'lodash';
import { validateFitInputs } from '../ops';
import { IMlModel, Type1DMatrix, Type2DMatrix } from '../types';
import math from '../utils/MathExtra';

const { isMatrix } = math.contrib;

interface StrNumDict {
  [key: string]: ReadonlyArray<ReadonlyArray<number>>;
}

interface InterfaceFitModel<T> {
  classCategories: ReadonlyArray<T>;
  mean: tfc.Tensor<tfc.Rank>;
  variance: tfc.Tensor<tfc.Rank>;
}

interface InterfaceFitModelAsArray<T> {
  classCategories: ReadonlyArray<T>;
  mean: ReadonlyArray<number>;
  variance: ReadonlyArray<number>;
}

const SQRT_2PI = Math.sqrt(Math.PI * 2);

/**
 * The Naive is an intuitive method that uses probabilistic of each attribute
 * being in each class to make a prediction. It uses Gaussian function to estimate
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
export class GaussianNB<T extends number | string = number>
  implements IMlModel<T> {
  /**
   * Naive Bayes summary according to classes
   */
  private _modelState: InterfaceFitModel<T>;

  /**
   * @param  {Type2DMatrix<number>=null} X - array-like or sparse matrix of shape = [n_samples, n_features]
   * @param  {Type1DMatrix<T>=null} y - array-like, shape = [n_samples] or [n_samples, n_outputs]
   * @returns void
   */
  public fit(X: Type2DMatrix<number> = null, y: Type1DMatrix<T> = null): void {
    validateFitInputs(X, y);
    this._modelState = this.fitModel(X, y);
  }

  /**
   * @param  {Type2DMatrix<number>} X
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
   * @returns InterfaceFitModel
   */
  public model(): InterfaceFitModel<T> {
    return this._modelState;
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
   * @param  {InterfaceFitModelAsArray<T>} modelState
   * @returns void
   */
  public fromJSON(modelState: InterfaceFitModelAsArray<T>): void {
    const len: number = modelState.mean.length;
    this._modelState = {
      classCategories: modelState.classCategories,
      mean: tfc.tensor2d(modelState.mean as number[], [len / 2, 2]),
      variance: tfc.tensor2d(modelState.variance as number[], [len / 2, 2])
    };
  }

  /**
   * Returns a model checkpoint
   *
   * @returns InterfaceFitModelAsArray
   */
  public toJSON(): InterfaceFitModelAsArray<T> {
    return {
      classCategories: this._modelState.classCategories,
      mean: [...this._modelState.mean.dataSync()],
      variance: [...this._modelState.variance.dataSync()]
    };
  }

  /**
   * Make a prediction
   *
   * @param  {ReadonlyArray<number>} X- values to predict in Matrix format
   * @returns T
   */
  private singlePredict(X: ReadonlyArray<number>): T {
    const matrixX: tfc.Tensor<tfc.Rank> = tfc.tensor1d(
      X as number[],
      'float32'
    );
    const numFeatures = matrixX.shape[0];

    // Comparing input and summary shapes
    const summaryLength = this._modelState.mean.shape[1];
    if (numFeatures !== summaryLength) {
      throw new Error(
        `Prediction input ${
          matrixX.shape[0]
        } length must be equal or less than summary length ${summaryLength}`
      );
    }

    const mean = this._modelState.mean.clone();
    const variance = this._modelState.variance.clone();

    const meanValPow: tfc.Tensor<tfc.Rank> = matrixX
      .sub(mean)
      .pow(tfc.scalar(2))
      .mul(tfc.scalar(-1));

    const exponent: tfc.Tensor<tfc.Rank> = meanValPow
      .div(variance.mul(tfc.scalar(2)))
      .exp();
    const innerDiv: tfc.Tensor<tfc.Rank> = tfc
      .scalar(SQRT_2PI)
      .mul(variance.sqrt());
    const probabilityArray: tfc.Tensor<tfc.Rank> = tfc
      .scalar(1)
      .div(innerDiv)
      .mul(exponent);

    const selectionIndex = probabilityArray
      .prod(1)
      .argMax()
      .dataSync()[0];

    return this._modelState.classCategories[selectionIndex];
  }

  /**
   * Summarise the dataset per class using "probability density function"
   *
   * @param  {Type2DMatrix<number>} X
   * @param  {ReadonlyArray<T>} y
   * @returns InterfaceFitModel
   */
  private fitModel(
    X: Type2DMatrix<number>,
    y: Type1DMatrix<T>
  ): InterfaceFitModel<T> {
    const classCategories: ReadonlyArray<T> = [...new Set(y)].sort();

    // Separates X by classes specified by y argument
    const separatedByCategory: StrNumDict = zip<ReadonlyArray<number>, T>(
      X,
      y
    ).reduce((groups, [row, category]) => {
      groups[category.toString()] = groups[category.toString()] || [];
      groups[category.toString()].push(row);

      return groups;
    }, {});

    const momentStack = classCategories.map((category: T) => {
      const classFeatures: tfc.Tensor<tfc.Rank.R2> = tfc.tensor2d(
        separatedByCategory[category.toString()] as number[][],
        null,
        'float32'
      );
      const classMoments = tfc.moments(classFeatures, [0]);
      return classMoments;
    });

    // For every class we have a mean and variance for each feature
    const mean: tfc.Tensor<tfc.Rank> = tfc.stack(momentStack.map(m => m.mean));
    const variance: tfc.Tensor<tfc.Rank> = tfc.stack(
      momentStack.map(m => m.variance)
    );

    // TODO check for NaN or 0 variance
    // setTimeout(() => {
    //   if ([...variance.dataSync()].some(i => i === 0)) {
    //     console.error('No variance on one of the features. Errors may result.');
    //   }
    // }, 100);

    return {
      classCategories,
      mean,
      variance
    };
  }
}
