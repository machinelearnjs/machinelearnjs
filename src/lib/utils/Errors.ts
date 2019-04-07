// NOTE: Below custom errors are hack because Jest has a bug with asserting error types

/**
 * The error is used for class initiation failures due to invalid arguments.
 * @ignore
 */
export const ConstructionError = function(message) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
};

/**
 * The error is used for any validation errors. Such as an argument type check failure would raise this error.
 * @ignore
 */
export const ValidationError = function(message) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
};

/**
 * @ignore
 */
export const Validation1DMatrixError = function(message) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
};

/**
 * @ignore
 */
export const Validation2DMatrixError = function(message) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
};

/**
 * The error is used when a matrix does not contain a consistent type for its elements
 * @ignore
 */
export const ValidationMatrixTypeError = function(message) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
};

/**
 * @ignore
 */
export const ValidationClassMismatch = function(message) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
};

/**
 * @ignore
 */
export const ValidationKeyNotFoundError = function(message) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
};

/**
 * @ignore
 */
export const ValidationInconsistentShape = function(message) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
};
