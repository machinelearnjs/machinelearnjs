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
/**
 * Check below array conditions
 * - multiclass
 *    - e.g. [ [1, 2], [2, 3] ]
 *      Then it sets multiclass value to true
 * - isArray<boolean>
 *   If the given arr is an array then the value is true else false
 * @param arr
 * @returns {any}
 */
function checkArray(arr) {
    return _.flowRight(
    // Check multiclass
    x => {
        const firstEle = _.get(arr, '[0]');
        if (_.isArray(firstEle)) {
            return _.set(x, 'multiclass', true);
        }
        else {
            return _.get(x, 'multiclass', false);
        }
    }, 
    // Check it is an array
    x => {
        if (!_.isArray(arr)) {
            return _.set(x, 'isArray', true);
        }
        return _.set(x, 'isArray', false);
    })({});
}
exports.checkArray = checkArray;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9saWIvdXRpbHMvdmFsaWRhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSwwQ0FBNEI7QUFFNUI7Ozs7Ozs7OztHQVNHO0FBQ0gsb0JBQTJCLEdBQUc7SUFDNUIsT0FBTyxDQUFDLENBQUMsU0FBUztJQUNoQixtQkFBbUI7SUFDbkIsQ0FBQyxDQUFDLEVBQUU7UUFDRixNQUFNLFFBQVEsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNuQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDdkIsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDckM7YUFBTTtZQUNMLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ3RDO0lBQ0gsQ0FBQztJQUNELHVCQUF1QjtJQUN2QixDQUFDLENBQUMsRUFBRTtRQUNGLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ25CLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ2xDO1FBQ0QsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDcEMsQ0FBQyxDQUNGLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDUixDQUFDO0FBbkJELGdDQW1CQyJ9