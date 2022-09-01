/* eslint-disable no-use-before-define */
/* eslint-disable max-classes-per-file */

class GeneralError extends Error {
  constructor(errorName, description) {
    super();
    this.error_name = errorName;
    this.description = description;
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

  getErrorName() {
    return this.error_name;
  }

  getDescription() {
    return this.description;
  }
}

// Error Classes

/** */
class BadRequest extends GeneralError { }
/** */
class Conflict extends GeneralError { }
/** */
class Unauthorized extends GeneralError { }
/** */
class Forbidden extends GeneralError { }
/** */
class TooManyRequests extends GeneralError { }
/** */
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
