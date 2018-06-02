/* tslint:disable */

import { DecisionTreeClassifier } from "./tree";

const decision = new DecisionTreeClassifier();

const X = [[1, 2, 3], [2, 3, 4]];

decision._get_split({ X, y: null });
decision._gini_index(X, 1);