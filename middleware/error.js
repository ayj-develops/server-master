/* eslint-disable no-use-before-define */
/* eslint-disable max-classes-per-file */

/**
 * Superclass invokes subclass instances to return status codes
 */
class GeneralError extends Error {
  constructor(message, stacktrace) {
    super();
    this.message = message;
    this.stacktrace = stacktrace || 'No error stacktrace provided';
  }

  getCode() {
    if (this instanceof BadRequest) return 400;
    if (this instanceof Conflict) return 409;
    if (this instanceof Unauthorized) return 401;
    if (this instanceof Forbidden) return 403;
    if (this instanceof TooManyRequests) return 429;
    if (this instanceof NotFound) return 404;
    return 500;
  }

  getMessage() {
    return this.message;
  }

  getStackTrace() {
    return this.stacktrace;
  }
}

// Error Classes

class BadRequest extends GeneralError { }
class Conflict extends GeneralError { }
class Unauthorized extends GeneralError { }
class Forbidden extends GeneralError { }
class TooManyRequests extends GeneralError { }
class NotFound extends GeneralError { }

module.exports = {
  GeneralError,
  BadRequest,
  Conflict,
  Unauthorized,
  Forbidden,
  TooManyRequests,
  NotFound,
};
