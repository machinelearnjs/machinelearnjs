/**
 * Split arrays or matrices into random train and test subsets
 * @param {Array<any>} X
 * @param {Array<any>} y
 * @param {Number} test_size
 * @param {Number} train_size
 * @param {Number} random_state
 * @param {boolean} shuffle
 * @param stratify
 * return X_train, y_train, X_test, y_test
 */
export declare function train_test_split(X?: any[], y?: any[], {test_size, train_size, random_state, shuffle, stratify}?: {
    test_size?: number;
    train_size?: number;
    random_state?: number;
    shuffle?: boolean;
    stratify?: boolean;
}): {
    X_train: any[];
    y_train: any[];
    X_test: any[];
    y_test: any[];
};
