const express = require('express');
const bodyParser = require('body-parser');
const hash = require('object-hash');
const User = require('../models/user.model');
const { checkExist } = require('./exist');

const router = express.Router();
const jsonParser = bodyParser.json();

// TODO: Secure endpoint
// Registers the user

router.post('/create', jsonParser, async (req, res) => {
  let { email } = req.body;
  // do not await when querying mongoose
  if (!checkExist(email)) {
    res.status(400).send({ Message: 'Email parameter is missing' });
  } else if (!email.includes('tdsb.on.ca')) {
    res.status(400).json({ Message: 'Non TDSB users are not allowed' });
  } else {
    email = hash(email, { algorithm: 'sha1' });
    User.findOne({ email }, (err, user) => {
      if (err) res.status(500).json({ Message: 'Error' });// some error the server encounters
      else if (user) res.status(400).json({ Message: 'Email is already in use' }); // if user exists then that means the email is taken
      else {
        // Create a new user
        const newUser = new User({ email });
        newUser.save()
          .then(() => {
            res.status(201).json({ Message: 'Success' });
          })
          .catch((err) => res.status(500).json({ Message: 'Server Error', Error: `${err}` }));
      }
    });
  }
});

router.get('/', jsonParser, async (req, res) => {
  if ((req.query._id === null || req.query._id === undefined)
    && (req.query.email === null || req.query.email === undefined)) {
    res.status(200).send(await User.find());
  } else if ((req.query._id === null || req.query._id === undefined) && req.query.email) {
    User.findOne(({ email: req.query.email }), (err, user) => {
      if (err) {
        res.status(500).send({ Message: 'Error' });
      } else if (user === null) {
        res.status(400).send({ Message: 'User not found' });
      } else {
        res.status(200).send(user);
      }
    });
  } else if ((req.query.email === null || req.query.email === undefined) && req.query._id) {
    User.findById((req.query._id), (err, user) => {
      if (err) {
        res.status(500).send({ Message: 'Error' });
      } else if (user === null) {
        res.status(400).send({ Message: 'User not found' });
      } else {
        res.status(200).send(user);
      }
    });
  }
});

router.delete('/delete', jsonParser, async (req, res) => {
  let { email } = req.body;
  email = hash(email, { algorithm: 'sha1' });
  User.findOne({ email }, (err, user) => {
    if (err) {
      res.status(500).send({ Message: 'Error' });
    } else if (user === null) {
      res.status(400).send({ Message: 'User not found' });
    } else {
      User.findOneAndDelete({ email }, (err, user) => {
        if (err) res.status(500).json({ Message: 'Error' });
        else {
          res.status(200).send({ Message: 'Success', user });
        }
      });
    }
  });
});

router.put('/update', jsonParser, async (req, res) => {
  const { _id, pfp } = req.body;
  User.findById({ _id }, async (err, user) => {
    if (_id === undefined) {
      res.status(400).send({ Message: 'Id parameter missing' });
    } else if (err) {
      res.status(500).send({ Message: 'Error' });
    } else if (user === null) {
      res.status(400).send({ Message: 'User not found' });
    } else if (_id !== user._id) {
      res.status(400).send({ Message: 'You are not this user' });
    } else {
      User.findByIdAndUpdate({ _id }, { pfp }, (err, user) => {
        if (err) {
          res.status(500).send({ Message: 'Error' });
        } else if (user) {
          res.status(400).send({ Message: 'User not found' });
        } else {
          res.status(200).send({ Message: 'Success' });
        }
      });
    }
  });
});

module.exports = router;
