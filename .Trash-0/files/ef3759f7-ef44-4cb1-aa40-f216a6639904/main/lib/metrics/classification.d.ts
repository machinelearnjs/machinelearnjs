/**
 *
 * @param {any} y_true
 * @param {any} y_pred
 * @param {any} normalize
 * @param {any} sample_weight
 */
export declare function accuracyScore({y_true, y_pred, normalize, sample_weight}: {
    y_true: any;
    y_pred: any;
    normalize?: boolean;
    sample_weight?: null;
}): number;
export declare function zeroOneLoss({y_true, y_pred, normalize, sample_weight}: {
    y_true: any;
    y_pred: any;
    normalize?: boolean;
    sample_weight?: null;
}): number;
