/* eslint-disable consistent-return */
const admin = require('firebase-admin');
const { GeneralError } = require('./error');

const decodeIdToken = async (req, res, next) => {
  if (req.headers.authorization) {
    if (req.headers.authorization.startsWith('Bearer ')) {
      const idToken = req.headers.authorization.split('Bearer ')[1];

      try {
        if (!idToken) throw new GeneralError('Server Error: Could not process because no authorization header was provided');
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        if (decodedToken) {
          req.currentUser = decodedToken;
          return next();
        }
        return res.status(401).send({ status: 'error', message: 'Unauthorized: Not authenticated' });
      } catch (err) {
        return res.status(500).send({
          status: 'error', message: `Server error: ${err}`,
        });
      }
    }
  } else {
    return res.status(500).send({
      status: 'error', message: 'Server Error: Could not process because no authorization header was provided',
    });
  }
};

module.exports = decodeIdToken;
