import { train_test_split } from './_split'

const X = [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9]]
const y = [0, 1, 2, 3, 4]

console.log(train_test_split(X, y, { test_size: 0.33, random_state: 42 }));
