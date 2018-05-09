export declare class Imputer {
    private missingValues;
    private strategy;
    private axis;
    private verbose;
    private copy;
    private means;
    /**
     *
     * @param {any} missingValues
     * @param {string} strategy
     * @param {number} axis   0 = column axis & 1 = row axis
     * @param {number} verbose
     * @param {boolean} copy
     */
    constructor({missingValues, strategy, axis, verbose, copy}: {
        missingValues?: null;
        strategy?: string;
        axis?: number;
        verbose?: number;
        copy?: boolean;
    });
    /**
     * Calculate array of numbers as array of mean values
     * Examples:
     * [ [ 1, 2 ], [ null, 3 ], [ 123, 3 ] ]
     * => [ 1.5, 3, 63 ]
     *
     * [ [ 1, 123 ], [ 2, 3, 3 ] ]
     * => [ 62, 2.6666666666666665 ]
     *
     * @param matrix
     * @param {Array<string>} steps
     */
    private calcArrayMean;
    fit(X: any): void;
    fit_transform(X: Array<any>): any[];
}
