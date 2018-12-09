import * as tf from '@tensorflow/tfjs';
import { countBy, zip } from 'lodash';
import { reshape, validateFitInputs, validateMatrix2D } from '../ops';
import { IMlModel, Type1DMatrix, Type2DMatrix } from '../types';

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
  /**
   * List of classes
   * @example
   * Given [1, 0, 1, 0, 2, 2, 2], categories are
   * [0, 1, 2]
   */
  private classCategories: T[];
  /**
   * Multinomial distribution values. It is always two dimensional values.
   */
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
    validateFitInputs(X, y);
    const {
      classCategories,
      multinomialDist,
      priorProbability
    } = this.fitModel(X, y);
    this.classCategories = classCategories as T[];
    this.multinomialDist = multinomialDist;
    this.priorProbability = priorProbability;
  }

  /**
   * Predict multiple rows
   *
   * @param  {Type2DMatrix<number>} X - values to predict in Matrix format
   * @returns T
   */
  public predict(X: Type2DMatrix<number>): T[] {
    validateMatrix2D(X);
    return X.map(x => this.singlePredict(x));
  }

  /**
   * Returns a model checkpoint
   *
   * @returns InterfaceFitModelAsArray
   */
  public toJSON(): {
    classCategories: Type1DMatrix<T>;
    multinomialDist: Type2DMatrix<number>;
    priorProbability: Type1DMatrix<number>;
  } {
    return {
      classCategories: Array.from(this.classCategories),
      priorProbability: Array.from(this.priorProbability.dataSync()),
      multinomialDist: reshape(
        Array.from(this.multinomialDist.dataSync()),
        this.multinomialDist.shape
      ) as Type2DMatrix<number>
    };
  }

  /**
   * @param  {InterfaceFitModelAsArray<T>} modelState
   * @returns void
   */
  public fromJSON(modelState: {
    multinomialDist: Type2DMatrix<number>;
    priorProbability: Type1DMatrix<number>;
    classCategories: Type1DMatrix<T>;
  }): void {
    this.classCategories = modelState.classCategories;
    this.priorProbability = tf.tensor1d(modelState.priorProbability);
    this.multinomialDist = tf.tensor2d(modelState.multinomialDist);
  }

  /**
   * Make a prediction
   *
   * @param  {ReadonlyArray<number>} predictRow
   * @returns T
   */
  private singlePredict(predictRow: Type1DMatrix<number>): T {
    const matrixX = tf.tensor1d(predictRow as number[], 'float32');
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

    // log is important to use different multinomial formula instead of the factorial formula
    // The multinomial naive Bayes classifier becomes a linear
    // classifier when expressed in log-space
    // const priorProbability = Math.log(1 / classCount);
    const fitProbabilites = this.multinomialDist
      .clone()
      .mul(matrixX as tf.Tensor);

    // sum(1) is summing columns
    const allProbabilities = fitProbabilites
      .sum(1)
      .add(this.priorProbability as tf.Tensor);

    const selectionIndex = allProbabilities.argMax().dataSync()[0];
    allProbabilities.dispose();

    return this.classCategories[selectionIndex] as T;
  }

  /**
   * Summarise the dataset per class
   *
   * @param  {Type2DMatrix<number>} X - input distribution
   * @param  {ReadonlyArray<T>} y - classes to train
   */
  private fitModel(
    X: Type2DMatrix<number>,
    y: ReadonlyArray<T>
  ): {
    classCategories: T[];
    multinomialDist: tf.Tensor2D;
    priorProbability: tf.Tensor1D;
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
    const frequencySumByClass = tf.stack(
      classCategories.map((category: T) =>
        tf.addN(separatedByCategory[category.toString()])
      )
    );
    const productReducedRow = Array.from(frequencySumByClass.sum(1).dataSync());

    // A class's prior may be calculated by assuming equiprobable classes
    // (i.e., priors = (number of samples in the class) / (total number of samples))
    const priorProbability: tf.Tensor1D = tf
      .tensor1d(
        classCategories.map(c => classCounts[c.toString()] / y.length),
        'float32'
      )
      .log();
    // log transform to use linear multinomial forumla
    const multinomialDist: tf.Tensor2D = frequencySumByClass
      .add(tf.scalar(this.alpha) as tf.Tensor)
      .div(
        tf
          .tensor2d(
            productReducedRow as number[],
            [frequencySumByClass.shape[0], 1],
            'float32'
          )
          .add(tf.scalar(numFeatures * this.alpha) as tf.Tensor)
      )
      .log() as tf.Tensor2D;
    return {
      classCategories,
      multinomialDist,
      priorProbability
    };
  }
}
