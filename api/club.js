const express = require('express');

const router = express.Router();
const Club = require('../models/club');

router.get('/', (req, res, next) => {
  Club.find()
    .then((clubs) => {
      res.status(200).json(clubs);
    })
    .catch((err) => {
      next(err);
    });
});


router.post('/create', (req, res, next) => {
  const {
    name: clubName,
    description: clubDescription,
    instagram: clubInstagram,
    google_classroom_code: clubGoogleClasroomCode,
    signup_link: clubSignupLink,
    clubfest_link: clubClubfestLink,
    teacher: clubTeacher,
  } = req.body;

  if (!clubName || !clubDescription || !clubTeacher) {
    const err = new BadRequest('Missing fields');
    err.status = 400;
    next(err);
  }

  const socialsObject = {
    instagram: clubInstagram,
    google_classroom_code: clubGoogleClasroomCode,
    signup_link: clubSignupLink,
  };

  const clubObject = {
    name: clubName,
    description: clubDescription,
    socials: socialsObject,
    clubfest_link: clubClubfestLink,
    teacher: clubTeacher,
  };

  if (clubDescription.length < 50 || clubDescription.length > 500) {
    const err = new Error('Club description must be between 50 and 500 characters long');
    err.status = 400;
    next(err);
  } else {
    Club.create({

    })
      .then((club) => {
        res.status(201).json(club);
      })
      .catch((err) => {
        next(err);
      });
  }
});

// write a function to get a single club and handle errors with the error handler middleware
router.get('/:id', (req, res, next) => {
  Club.findById(req.params.id)
    .then((club) => {
      res.status(200).json(club);
    })
    .catch((err) => {
      next(err);
    });
});
