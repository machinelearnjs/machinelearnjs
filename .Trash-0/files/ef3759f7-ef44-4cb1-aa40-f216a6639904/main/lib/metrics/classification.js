"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = __importStar(require("lodash"));
const validation_1 = require("../utils/validation");
function _weightedSum({ sampleScore, sampleWeight = null, normalize = false }) {
    if (normalize) {
        return _.mean(sampleScore);
    }
    else {
        return _.sum(sampleScore);
    }
}
/**
 *
 * @param {any} y_true
 * @param {any} y_pred
 * @param {any} normalize
 * @param {any} sample_weight
 */
function accuracyScore({ y_true, y_pred, normalize = true, sample_weight = null }) {
    // TODO: Multi label
    if (validation_1.checkArray(y_true).multiclass || validation_1.checkArray(y_pred).multiclass) {
        throw new Error('Multiclass is not supported yet!');
    }
    if (_.size(y_true) !== _.size(y_pred)) {
        throw new Error('y_true and y_pred are not equal in size!');
    }
    const normalised = _.map(y_true, (_, index) => {
        const yTrue = y_true[index];
        const yPred = y_pred[index];
        return yTrue === yPred ? 1 : 0;
    });
    return _weightedSum({
        normalize,
        sampleScore: normalised
    });
}
exports.accuracyScore = accuracyScore;
function zeroOneLoss({ y_true, y_pred, normalize = true, sample_weight = null }) {
    if (normalize) {
        return 1 - accuracyScore({ y_true, y_pred });
    }
    else {
        // If normalize is true
    }
}
exports.zeroOneLoss = zeroOneLoss;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhc3NpZmljYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL21ldHJpY3MvY2xhc3NpZmljYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsMENBQTRCO0FBQzVCLG9EQUFpRDtBQUVqRCxzQkFBc0IsRUFBRSxXQUFXLEVBQUUsWUFBWSxHQUFHLElBQUksRUFBRSxTQUFTLEdBQUcsS0FBSyxFQUFFO0lBQzNFLElBQUksU0FBUyxFQUFFO1FBQ2IsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQzVCO1NBQU07UUFDTCxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDM0I7QUFDSCxDQUFDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsdUJBQThCLEVBQzVCLE1BQU0sRUFDTixNQUFNLEVBQ04sU0FBUyxHQUFHLElBQUksRUFDaEIsYUFBYSxHQUFHLElBQUksRUFDckI7SUFDQyxvQkFBb0I7SUFDcEIsSUFBSSx1QkFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFVBQVUsSUFBSSx1QkFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFVBQVUsRUFBRTtRQUNsRSxNQUFNLElBQUksS0FBSyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7S0FDckQ7SUFDRCxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUNyQyxNQUFNLElBQUksS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7S0FDN0Q7SUFDRCxNQUFNLFVBQVUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRTtRQUM1QyxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDNUIsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVCLE9BQU8sS0FBSyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakMsQ0FBQyxDQUFDLENBQUM7SUFFSCxPQUFPLFlBQVksQ0FBQztRQUNsQixTQUFTO1FBQ1QsV0FBVyxFQUFFLFVBQVU7S0FDeEIsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQXZCRCxzQ0F1QkM7QUFFRCxxQkFBNEIsRUFDMUIsTUFBTSxFQUNOLE1BQU0sRUFDTixTQUFTLEdBQUcsSUFBSSxFQUNoQixhQUFhLEdBQUcsSUFBSSxFQUNyQjtJQUNDLElBQUksU0FBUyxFQUFFO1FBQ2IsT0FBTyxDQUFDLEdBQUcsYUFBYSxDQUFDLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7S0FDOUM7U0FBTTtRQUNMLHVCQUF1QjtLQUN4QjtBQUNILENBQUM7QUFYRCxrQ0FXQyJ9