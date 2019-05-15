import { Type1DMatrix } from '../types';

export interface TrainTestPair {
  train: Type1DMatrix<any>;
  test: Type1DMatrix<any>;
}
export abstract class BaseShuffleSplit implements IterableIterator<TrainTestPair> {
  n_splits: number;
  test_size: number;
  train_size: number;
  random_state: number;
  _default_test_size: number;
  X: Type1DMatrix<any>;
  y: Type1DMatrix<any>;
  groups: Type1DMatrix<any>;
  constructor(
    n_splits = 10,
    test_size = null,
    train_size = null,
    random_state = null,
    _default_test_size = 0.1,
    X: Type1DMatrix<any>,
    y: Type1DMatrix<any>,
    groups: Type1DMatrix<any>,
  ) {
    this.n_splits = n_splits;
    this.test_size = test_size;
    this.train_size = train_size;
    this.random_state = random_state;
    this._default_test_size = _default_test_size;
    this.X = X;
    this.y = y;
    this.groups = groups;
    this.generateSplits();
  }

  next(): IteratorResult<TrainTestPair> {
    return this.iterIndices();
  }

  // @abstractmethod
  abstract generateSplits(): void;

  // @abstractmethod
  abstract iterIndices(): IteratorResult<TrainTestPair>;

  getNSplits(): number {
    return this.n_splits;
  }

  [Symbol.iterator](): IterableIterator<TrainTestPair> {
    return this;
  }
}
