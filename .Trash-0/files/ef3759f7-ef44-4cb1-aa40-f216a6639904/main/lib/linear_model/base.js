"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const SimpleLinearRegression = __importStar(require("ml-regression-simple-linear"));
class LinearRegression {
    constructor() {
        this.lr = null;
    }
    fit({ X, y }) {
        this.lr = new SimpleLinearRegression(X, y);
    }
    predict(predictX) {
        return this.lr.predict(predictX);
    }
}
exports.LinearRegression = LinearRegression;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9saWIvbGluZWFyX21vZGVsL2Jhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsb0ZBQXNFO0FBRXRFO0lBQUE7UUFDVSxPQUFFLEdBQVEsSUFBSSxDQUFDO0lBU3pCLENBQUM7SUFQUSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQ2pCLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxzQkFBc0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVNLE9BQU8sQ0FBQyxRQUFRO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDbkMsQ0FBQztDQUNGO0FBVkQsNENBVUMifQ==