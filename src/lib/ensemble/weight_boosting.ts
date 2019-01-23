import * as tf from '@tensorflow/tfjs';
import { inferShape } from "../ops";
import {IMlModel, Type1DMatrix, Type2DMatrix, TypeModelState} from "../types";

class DecisionStump {
    public polarity = 1;
    public featureIndex = null;
    public threshold = null;
    public alpha = null;
}

export class AdaboostClassifier implements IMlModel<number> {
    private nCls: number;
    private cls: DecisionStump[] = [];

    constructor({
       n_cls = 10,
    }: {
      n_cls?: number;
    } = {
        n_cls: 10,
    }) {
        this.nCls = n_cls;
    }


    public fit(X: Type2DMatrix<number>, y: Type1DMatrix<number>): void {
        const tensorX = tf.tensor2d(X);
        const tensorY = tf.tensor1d(y);
        const [ nSamples, nFeatures ] = inferShape(X);

        // Initialise weights to 1/n
        const w = tf.fill([nSamples], (1 / nSamples));

        for (let i = 0; i < this.nCls; i++) {
            const clf = new DecisionStump();

            for (let j = 0; j < nFeatures; j++) {
                const featureValues = tensorX.slice([0], [j]).expandDims(1);
                // const uniqueValues = featureValues.uniq

            }
        }
    }

    public fromJSON(state: TypeModelState): void {
    }

    public predict(X: Type2DMatrix<number> | Type1DMatrix<number>): number[] | number[][] {
        return undefined;
    }

    public toJSON(): TypeModelState {
        return undefined;
    }

}