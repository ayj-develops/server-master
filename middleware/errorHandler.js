/* eslint-disable no-unused-vars */
const { GeneralError } = require('./error');

/**
 * Handles errors, to use wrap in try catch and pass catch err into next()
 *
 * @param {*} err   -> error
 * @param {*} req   -> request obj
 * @param {*} res   -> response obj
 * @param {*} next  -> callback
 * @returns response status and message
 */
const handleErrors = (err, req, res, next) => {
  if (err instanceof GeneralError) {
    return res.status(err.getCode()).send({
      status: 'error',
      message: err.getMessage(),
      stacktrace: err.getStackTrace(),
    });
  }

  return res.status(500).send({ status: 'error', message: err.message });
};

module.exports = handleErrors;
