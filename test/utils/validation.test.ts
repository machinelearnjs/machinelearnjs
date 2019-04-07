import { Iris } from '../../src/lib/datasets';
import { ValidationClassMismatch } from '../../src/lib/utils/Errors';
import {
  checkArray,
  validateFitInputs,
  validateMatrix1D,
  validateMatrix2D,
  validateMatrixType,
} from '../../src/lib/utils/validation';
import { matchExceptionWithSnapshot } from '../util_testing';

describe('checkArray', () => {
  it("should check that it's not an array", () => {
    const arr = null;
    const result = checkArray(arr);
    expect(result.isArray).toBe(false);
    expect(result.multiclass).toBe(false);
  });
  it("should check that it's an array", () => {
    const arr = [1, 2, 3];
    const result = checkArray(arr);
    expect(result.isArray).toBe(true);
    expect(result.multiclass).toBe(false);
  });
  it("should check that it's a multi-class array", () => {
    const arr = [[1, 2], [1, 2]];
    const result = checkArray(arr);
    expect(result.isArray).toBe(true);
    expect(result.multiclass).toBe(true);
  });
  it("should check that it's a multi-class if sub-arrays are empty", () => {
    const arr = [[], []];
    const result = checkArray(arr);
    expect(result.isArray).toBe(true);
    expect(result.multiclass).toBe(true);
  });
});

// Dummy data
const X1 = [[1, 2], [3, 4], [5, 6]];
const y1 = [1, 2, 3];

const X2 = [[[1, 2], [3, 4], [5, 6]], [[1, 2], [3, 4], [5, 6]]];
const y2 = [1, 2, 3];

describe('MatrixValidations', () => {
  let irisData = null;
  let irisTargets = null;
  beforeAll(async () => {
    const { data, targets } = await new Iris().load();
    irisData = data;
    irisTargets = targets;
  });

  describe('validateTrainInputs', () => {
    it('should validate train inputs against X1 and y1', () => {
      validateFitInputs(X1, y1);
    });

    it('should throw an error if the train input X is 3D', () => {
      try {
        validateFitInputs(X2, y2);
      } catch (err) {
        expect(err).toBeInstanceOf(ValidationClassMismatch);
      }
    });

    it('should throw an error if train input y is 2D', () => {
      try {
        validateFitInputs(X1, X1);
      } catch (err) {
        expect(err).toBeInstanceOf(ValidationClassMismatch);
      }
    });

    it('should validate Iris dataset', () => {
      validateFitInputs(irisData, irisTargets);
    });
  });

  describe('validate1DMatrix', () => {
    it('should validate iris targets and y1', () => {
      validateMatrix1D(irisTargets);
      validateMatrix1D(y1);
    });

    it('should throw an exception when 1D matrix is not given', () => {
      matchExceptionWithSnapshot(validateMatrix1D, [irisData]);
      matchExceptionWithSnapshot(validateMatrix1D, [null]);
      matchExceptionWithSnapshot(validateMatrix1D, [1]);
      matchExceptionWithSnapshot(validateMatrix1D, ['test']);
    });
  });

  describe('validate2DMatrix', () => {
    it('should validate iris data and X1', () => {
      validateMatrix2D(irisData);
      validateMatrix2D(X1);
    });

    it('should throw an exception when 2D matrix is not given', () => {
      matchExceptionWithSnapshot(validateMatrix2D, [irisTargets]);
      matchExceptionWithSnapshot(validateMatrix2D, [y1]);
    });
  });

  describe('validateMatrixType', () => {
    it('should validate', () => {
      jest.setTimeout(10000);
      // Number
      validateMatrixType([1, 2, 3], ['number']);
      validateMatrixType([[1, 2], [3, 4]], ['number']);
      validateMatrixType([[[1, 2]], [[3, 4]]], ['number']);
      // String
      validateMatrixType(['1', '2', '3', '4'], ['string']);
      validateMatrixType([['1', '2'], ['3', '4']], ['string']);
      validateMatrixType([[['1', '2']], [['3', '4']]], ['string']);
      // Complex type
      validateMatrixType([[['1', 1]], [['3', 4]]], ['string', 'number']);
      validateMatrixType([[['1', 1]], [['3', true]]], ['string', 'number', 'boolean']);
    });
    it('should not validate', () => {
      matchExceptionWithSnapshot(validateMatrixType, [[1, 2, 3], ['string']]);
      matchExceptionWithSnapshot(validateMatrixType, [['1', '2', '3', '4'], ['boolean']]);
    });
  });
});
