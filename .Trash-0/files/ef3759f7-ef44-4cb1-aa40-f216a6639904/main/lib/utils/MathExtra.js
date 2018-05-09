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
const math = __importStar(require("mathjs"));
/**
 * Return the number of elements along a given axis.
 * @param {any} X: Array like input data
 * @param {any} axis
 */
const size = (X, axis = 0) => {
    const rows = _.size(X);
    if (rows === 0) {
        throw new Error('Invalid input array of size 0!');
    }
    if (axis === 0) {
        return rows;
    }
    else if (axis === 1) {
        return _.flowRight(_.size, a => _.get(a, '[0]'))(X);
    }
    throw new Error(`Invalid axis value ${axis} was given`);
};
/**
 * Get range of values
 * @param start
 * @param stop
 */
const range = (start, stop) => _.range(start, stop);
math.contrib = {
    size,
    range
};
exports.default = math;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWF0aEV4dHJhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpYi91dGlscy9NYXRoRXh0cmEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsMENBQTRCO0FBQzVCLDZDQUErQjtBQUUvQjs7OztHQUlHO0FBQ0gsTUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxHQUFHLENBQUMsRUFBRSxFQUFFO0lBQzNCLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkIsSUFBSSxJQUFJLEtBQUssQ0FBQyxFQUFFO1FBQ2QsTUFBTSxJQUFJLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO0tBQ25EO0lBQ0QsSUFBSSxJQUFJLEtBQUssQ0FBQyxFQUFFO1FBQ2QsT0FBTyxJQUFJLENBQUM7S0FDYjtTQUFNLElBQUksSUFBSSxLQUFLLENBQUMsRUFBRTtRQUNyQixPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDckQ7SUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLHNCQUFzQixJQUFJLFlBQVksQ0FBQyxDQUFDO0FBQzFELENBQUMsQ0FBQztBQUVGOzs7O0dBSUc7QUFDSCxNQUFNLEtBQUssR0FBRyxDQUFDLEtBQWEsRUFBRSxJQUFZLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBRXBFLElBQUksQ0FBQyxPQUFPLEdBQUc7SUFDYixJQUFJO0lBQ0osS0FBSztDQUNOLENBQUM7QUFFRixrQkFBZSxJQUFJLENBQUMifQ==