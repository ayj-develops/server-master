const crypto = require('crypto');
const { Unauthorized } = require('./error');

const apiKeyValidation = (req, res, next) => {
  const reqApiKey = req.headers.authorization;
  const hash = crypto.createHash('sha512');
  if (crypto.timingSafeEqual(hash.copy().update(reqApiKey).digest(), hash.copy().update('apiKey').digest())) {
    next();
  } else {
    throw new Unauthorized('invalid_access_token', 'Server Error: Could not process because the provided authorization header was invalid');
  }
};

module.exports = apiKeyValidation;
