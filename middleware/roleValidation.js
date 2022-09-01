const { Forbidden } = require('./error');

const roleValidation = (req, res, next) => {
  if (req.currentUser.status === 'teacher') {
    next();
  } else {
    throw new Forbidden('access_denied', 'Server Error: Could not process because the user is not authorized');
  }
};

module.exports = roleValidation;
