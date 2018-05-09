export declare class LabelEncoder {
    private classes;
    fit(X?: Array<any>): void;
    /**
     * Transforms labels using fitted classes
     * Given classes of ['amsterdam', 'paris', 'tokyo']
     * It transforms ["tokyo", "tokyo", "paris"]
     * Into [2, 2, 1]
     * @param X
     */
    transform(X: any): number[];
}
