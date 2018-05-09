"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:no-expression-statement
const data_1 = require("./data");
test('OneHotEncoder: buildOneHot', t => {
    const enc = new data_1.OneHotEncoder();
    const planetList = [
        { planet: 'mars', isGasGiant: false, value: 10 },
        { planet: 'saturn', isGasGiant: true, value: 20 },
        { planet: 'jupiter', isGasGiant: true, value: 30 }
    ];
    enc.encode(planetList, { dataKeys: ['value'] });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpYi9wcmVwcm9jZXNzaW5nL2RhdGEudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlDQUF5QztBQUN6QyxpQ0FBdUM7QUFFdkMsSUFBSSxDQUFDLDRCQUE0QixFQUFFLENBQUMsQ0FBQyxFQUFFO0lBQ3JDLE1BQU0sR0FBRyxHQUFHLElBQUksb0JBQWEsRUFBRSxDQUFDO0lBQ2hDLE1BQU0sVUFBVSxHQUFHO1FBQ2pCLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7UUFDaEQsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRTtRQUNqRCxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFO0tBQ25ELENBQUM7SUFDRixHQUFHLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxFQUFFLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNsRCxDQUFDLENBQUMsQ0FBQyJ9