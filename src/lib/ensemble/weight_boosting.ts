import {IMlModel, Type1DMatrix, Type2DMatrix, TypeModelState} from "../types";

class DecisionStump {

}

export class AdaboostClassifier implements IMlModel<number> {
    fit(X: Type2DMatrix<number>, y?: Type1DMatrix<number>): void {
    }

    fromJSON(state: TypeModelState): void {
    }

    predict(X: Type2DMatrix<number> | Type1DMatrix<number>): number[] | number[][] {
        return undefined;
    }

    toJSON(): TypeModelState {
        return undefined;
    }

}