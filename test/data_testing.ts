import { HeartDisease, Iris } from '../src/lib/datasets';
import { train_test_split } from '../src/lib/model_selection';
import { Type1DMatrix, Type2DMatrix } from '../src/lib/types';

/**
 * Retrieves Iris dummy data for testing
 */
export async function getIris(): Promise<{
  xTest: Type2DMatrix<number>; 
  xTrain: Type2DMatrix<number>;
  yTest: Type1DMatrix<number>;
  yTrain: Type1DMatrix<number>;
}> {
  const iris = new Iris();
  const { data, targets } = await iris.load();
  const { xTest, xTrain, yTest, yTrain } = train_test_split(data, targets, {
    test_size: 0.33,
    train_size: 0.67,
    random_state: 42,
  });
  return { xTest, xTrain, yTest, yTrain };
}

export async function getHeartDisease(): Promise<{
  xTest: Type2DMatrix<number>;
  xTrain: Type2DMatrix<number>;
  yTest: Type1DMatrix<number>;
  yTrain: Type1DMatrix<number>
}> {
  const heartDisease = new HeartDisease();
  const { data, targets } = await heartDisease.load();
  const { xTest, xTrain, yTest, yTrain } = train_test_split(data, targets, {
    test_size: 0.33,
    train_size: 0.67,
    random_state: 42
  });
  return { xTest, xTrain, yTest, yTrain };
}
