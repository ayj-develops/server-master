/* eslint-disable no-unused-vars */
const { GeneralError } = require('./error');

const handleErrors = (err, req, res, next) => {
  if (err instanceof GeneralError) {
    return res.status(err.getCode()).send({
      ok: false,
      error_id: err.getCode(),
      error_name: err.getErrorName(),
      description: err.getDescription(),
    });
  }

  return res.status(500).send({
    ok: false,
    error_id: 500,
    error_name: 'Internal Server Error',
    description: 'Something went wrong',
  });
};

module.exports = handleErrors;
