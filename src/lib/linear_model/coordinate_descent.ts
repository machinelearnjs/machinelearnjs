import { normalize, PolynomialFeatures } from '../preprocessing';
import { Type1DMatrix, Type2DMatrix } from '../types';
import { SGDRegressor, TypeLoss } from './stochastic_gradient';

export class Ridge extends SGDRegressor {
  constructor(
    {
      l2,
      epochs = 1000,
      learning_rate = 0.001
    }: {
      l2: number;
      epochs?: number;
      learning_rate?: number;
    } = {
      l2: null,
      epochs: 1000,
      learning_rate: 0.001
    }
  ) {
    if (l2 === null) {
      throw TypeError('Ridge cannot be initiated with null l2');
    }

    super({
      reg_factor: { l2 },
      learning_rate,
      epochs,
      loss: TypeLoss.L2.toString()
    });
  }
}

export class Lasso extends SGDRegressor {
  private degree: number;
  constructor(
    {
      degree = null,
      l1,
      epochs = 1000,
      learning_rate = 0.001
    }: {
      degree: number;
      l1: number;
      epochs?: number;
      learning_rate?: number;
    } = {
      degree: null,
      l1: null,
      epochs: 1000,
      learning_rate: 0.001
    }
  ) {
    if (l1 === null) {
      throw TypeError('Ridge cannot be initiated with null l1');
    }
    super({
      reg_factor: { l1 },
      learning_rate,
      epochs,
      loss: TypeLoss.L1.toString()
    });
    this.degree = degree;
  }

  /**
   *
   * @param X
   * @param y
   */
  public fit(X: Type2DMatrix<number>, y: Type1DMatrix<number>): void {
    const polynomial = new PolynomialFeatures({ degree: this.degree });
    const newX = normalize(polynomial.transform(X));
    super.fit(newX, y);
  }

  /**
   *
   * @param X
   */
  public predict(X: Type2DMatrix<number>): number[] {
    const polynomial = new PolynomialFeatures({ degree: this.degree });
    const newX = normalize(polynomial.transform(X));
    return super.predict(newX);
  }
}
