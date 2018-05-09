export declare class OneHotEncoder {
    /**
     * encode
     *
     * @param data - list of records to encode
     * @param opts - dataKeys: independent variables, labelKeys: dependent variables; mandatory
     * @return {{data: Array, decoders: Array}} - see readme for full explanation
     */
    encode(data: any, opts?: {
        dataKeys: any;
        labelKeys: any;
    }): {
        data: {}[][];
        decoders: any[];
    };
    /**
     * decode
     *
     * Transform the encoded data back into its original format
     */
    decode(encoded: any, decoders: any): {}[];
    /**
     * decodeRow
     *
     * Transform an encoded row back into its original format
     */
    decodeRow(row: any, decoders: any): {};
    /**
     * Standardizing field
     * Example dataset:
     * [ { planet: 'mars', isGasGiant: false, value: 10 },
     * { planet: 'saturn', isGasGiant: true, value: 20 },
     * { planet: 'jupiter', isGasGiant: true, value: 30 } ]
     *
     * @param key: each key/feature such as planet, isGasGiant and value
     * @param data: the entire dataset
     * @returns {any}
     */
    private standardizeField(key, data);
    private calculateStd;
    /**
     *
     * @param type
     * @param key
     * @param values
     * @returns {{encoded; decode: {type: any; mean: any; std: number; key: any}}}
     */
    private buildNumberOneHot(type, key, values);
    /**
     * Example usage:
     * boolEncoder.encode(true) => 1
     * boolEncoder.encode(false) => 0
     * @param type
     * @param key
     * @param values
     * @returns {{encode}}
     */
    private buildBooleanOneHot;
    /**
     * Example for internal reference (unnecessary details for those just using this module)
     * const encoder = buildOneHot(['RAIN', 'RAIN', 'SUN'])
     * // encoder == { encode: () => ... , lookupTable: ['RAIN', 'SUN'] }
     * encoder.encode('SUN')  // [0, 1]
     * encoder.encode('RAIN') // [1, 0]
     * encoder.encode('SUN')  // [1, 0]
     * // encoder.lookupTable can then be passed into this.decode to translate [0, 1] back into 'SUN'
     *
     * It's not ideal (ideally it would all just be done in-memory and we could return a "decode" closure,
     * but it needs to be serializable to plain old JSON.
     */
    private buildStringOneHot(type, key, values);
}
export declare class MinMaxScaler {
    private featureRange;
    private dataMax;
    private dataMin;
    private featureMax;
    private featureMin;
    private dataRange;
    private scale;
    private baseMin;
    constructor({featureRange}: {
        featureRange?: number[];
    });
    fit(X: Array<number>): void;
    fit_transform(X: Array<number>): number[];
}
export declare class Binarizer {
    private threshold;
    private copy;
    constructor({threshold, copy}: {
        threshold?: number;
        copy?: boolean;
    });
    /**
     * Currently fit does nothing
     * @param {Array<any>} X
     */
    fit(X: Array<any>): void;
    /**
     * Transforms matrix into binarized form
     * X = [[ 1., -1.,  2.],
     *      [ 2.,  0.,  0.],
     *      [ 0.,  1., -1.]]
     * becomes
     * array([[ 1.,  0.,  1.],
     *    [ 1.,  0.,  0.],
     *    [ 0.,  1.,  0.]])
     * @param {Array<any>} X
     */
    transform(X: Array<any>): any;
}
