/* eslint-disable consistent-return */
const admin = require('firebase-admin');
const crypto = require('crypto');
const { GeneralError, Unauthorized } = require('./error');

const decodeIdToken = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      if (req.headers.authorization.startsWith('Bearer ')) {
        const idToken = req.headers.authorization.split('Bearer ')[1];

        if (!idToken) throw new Unauthorized('access_token_required', 'Server Error: Could not process because no authorization header was provided');
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const hash = crypto.createHash('sha512');

        if (decodedToken) {
          const isStudent = crypto.timingSafeEqual(hash.copy().update(decodedToken.email).digest(), hash.copy().update('tdsb.on.ca').digest());
          req.currentUser = decodedToken;
          req.currentUser.status = isStudent ? 'student' : 'teacher';
          return next();
        }
        throw new Unauthorized('access_token_invalid', 'Server Error: Could not process because the provided authorization header was invalid');
      }
    } else {
      throw new GeneralError('server_error', 'Server Error: Could not process because no authorization header was provided');
    }
  } catch (err) {
    next(err);
  }
};

module.exports = decodeIdToken;
