
export default class BaseError extends Error {
  message: string;

  constructor(messageOrError?: string | Error) {
    let message: string;
    if (messageOrError instanceof Error) {
      message = messageOrError.message;
    } else {
      message = messageOrError;
    }
    super(message);
    this.message = message;
  }
}

/**
 * @ignore
 */
export class ValidationError extends BaseError {}

/**
 * @ignore
 */
export class Validation1DMatrixError extends ValidationError {}

/**
 * @ignore
 */
export class Validation2DMatrixError extends ValidationError {}
