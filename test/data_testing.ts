import { Iris } from '../src/lib/datasets';
import { train_test_split } from '../src/lib/model_selection';

/**
 * Retrieves Iris dummy data for testing
 */
export async function getIris(): Promise<{
  xTest: number[][];
  xTrain: number[][];
  yTest: number[];
  yTrain: number[];
}> {
  const iris = new Iris();
  const { data, targets } = await iris.load();
  const { xTest, xTrain, yTest, yTrain } = train_test_split(data, targets, {
    test_size: 0.33,
    train_size: 0.67,
    random_state: 42
  });
  return { xTest, xTrain, yTest, yTrain };
}
