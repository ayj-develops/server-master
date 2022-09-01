const ratelimit = require('express-rate-limit');
const { Unauthorized } = require('./error');

const rateLimiter = ratelimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many requests, please try again later.',
  headers: true,
});

const rateLimiterMiddleware = (req, res, next) => {
  try {
    rateLimiter(req, res, next);
  } catch (err) {
    throw new Unauthorized('too_many_requests', `Server Error: Could not process because of an internal server error: ${err.message}`);
  }
};

module.exports = rateLimiterMiddleware;
