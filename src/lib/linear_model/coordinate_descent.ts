// Import base SGD instead . TypeLoss
import { BaseSGD, TypeLoss } from './stochastic_gradient';

export class Ridge extends BaseSGD {
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
    super({
      reg_factor: { l1 },
      learning_rate,
      epochs,
      loss: TypeLoss.L1.toString()
    });
  }
}
