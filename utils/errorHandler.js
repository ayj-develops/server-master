/* eslint-disable no-unused-vars */
const { GeneralError, BadRequest } = require('./error');

/**
 * Handles errors, to use wrap in try catch and pass catch err into next()
 *
 * @param {*} err 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
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
