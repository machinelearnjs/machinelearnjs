import { RandomForestClassifier } from "./forest";

const X = [[0, 0], [1, 1], [2, 1], [1, 5], [3, 2]];
const y = [0, 1, 2, 3, 7];

const randomForest = new RandomForestClassifier();
randomForest.fit({ X, y });
