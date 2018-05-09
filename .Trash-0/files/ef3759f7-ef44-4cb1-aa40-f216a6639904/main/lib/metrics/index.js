"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ConfusionMatrix = __importStar(require("ml-confusion-matrix"));
/**
 * Reference: http://www.dataschool.io/simple-guide-to-confusion-matrix-terminology/
 * Official API Doc: https://mljs.github.io/confusion-matrix/
 * @param yTrue
 * @param yPred
 */
exports.confusion_matrix = ConfusionMatrix;
// const trueLabels =      [0, 1, 0, 1, 1, 0];
const trueLabels = [[0, 1, 1], [1, 0, 0]];
const predictedLabels = [1, 1, 1, 1, 0, 0];
const cm2 = new exports.confusion_matrix([[13, 2], [10, 5]], ['cheese', 'dog']);
console.log('acc', cm2.getAccuracy());
console.log(cm2.getFalseCount());
console.log(cm2.getIndex('dog'));
const classification_1 = require("./classification");
const accResult = classification_1.accuracyScore({
    y_true: [0, 1, 2, 3],
    y_pred: [0, 2, 1, 3]
});
console.log('accuracy result ', accResult);
const accResultNorm = classification_1.accuracyScore({
    y_true: [0, 1, 2, 3],
    y_pred: [0, 2, 1, 3],
    normalize: false
});
console.log('accuracy result iwht norm false ', accResultNorm);
const loss_zero_one_result = classification_1.zeroOneLoss({
    y_true: [1, 2, 3, 4],
    y_pred: [2, 2, 3, 5]
});
console.log('loss zero one ', loss_zero_one_result);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL21ldHJpY3MvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEscUVBQXVEO0FBRXZEOzs7OztHQUtHO0FBQ1UsUUFBQSxnQkFBZ0IsR0FBRyxlQUFlLENBQUM7QUFFaEQsOENBQThDO0FBQzlDLE1BQU0sVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFDLE1BQU0sZUFBZSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUUzQyxNQUFNLEdBQUcsR0FBRyxJQUFJLHdCQUFnQixDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBRXhFLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0FBQ3RDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7QUFDakMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFFakMscURBQThEO0FBRTlELE1BQU0sU0FBUyxHQUFHLDhCQUFhLENBQUM7SUFDOUIsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3BCLE1BQU0sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztDQUNyQixDQUFDLENBQUM7QUFFSCxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBRTNDLE1BQU0sYUFBYSxHQUFHLDhCQUFhLENBQUM7SUFDbEMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3BCLE1BQU0sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNwQixTQUFTLEVBQUUsS0FBSztDQUNqQixDQUFDLENBQUM7QUFFSCxPQUFPLENBQUMsR0FBRyxDQUFDLGtDQUFrQyxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBRS9ELE1BQU0sb0JBQW9CLEdBQUcsNEJBQVcsQ0FBQztJQUN2QyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDcEIsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0NBQ3JCLENBQUMsQ0FBQztBQUVILE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsb0JBQW9CLENBQUMsQ0FBQyJ9