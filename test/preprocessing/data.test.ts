// tslint:disable:no-expression-statement
import * as _ from 'lodash';
import { OneHotEncoder } from "../../src/lib/preprocessing/data";


describe('data:OneHotEncoder', () => {
  // Datasets for OneHotEncoding
  const planetList = [
    { planet: 'mars', isGasGiant: false, value: 10 },
    { planet: 'saturn', isGasGiant: true, value: 20 },
    { planet: 'jupiter', isGasGiant: true, value: 30 }
  ];

  it('should encode planet list correctly', () => {
    const enc = new OneHotEncoder();

    const expectedEncode =  [
      [ -1, 0, 1, 0, 0 ],
      [ 0, 1, 0, 1, 0 ],
      [ 1, 1, 0, 0, 1 ]
    ];
    const encoderInfo = enc.encode(planetList, {
      dataKeys: ['value', 'isGasGiant'],
      labelKeys: ['planet']
    });
    expect(_.isEqual(encoderInfo.data, expectedEncode)).toBe(true);
  });
});
