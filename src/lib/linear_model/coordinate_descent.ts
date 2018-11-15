// Import base SGD instead
import { SGDRegressor, TypeLoss } from './stochastic_gradient';

/*
Reminder: implement Lasso, Ridge and ElasticNet here
*/

/*
interface TypeRegFactorL1 {
  l1: number;
}

interface TypeRegFactorL2 {
  l2: number;
}

interface TypeRegFactorL1L2 {
  l1: number;
  l2: number;
}
*/

export class RidgeRegression extends SGDRegressor {
  constructor(
    {
      l1,
      epochs = 1000,
      learning_rate = 0.001
    }: {
      l1: number;
      epochs?: number;
      learning_rate?: number;
    } = {
      l1: null,
      epochs: 1000,
      learning_rate: 0.001
    }
  ) {
    super();
    this.epochs = epochs;
    this.learningRate = learning_rate;
    this.regFactor = { l1 };
    this.loss = TypeLoss.L1;
  }
}
