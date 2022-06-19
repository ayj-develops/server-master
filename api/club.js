const express = require('express');
const bodyParser = require('body-parser');
const { default: mongoose } = require('mongoose');
const { default: slugify } = require('slugify');
const Club = require('../models/club.model');
const {
  BadRequest, Conflict, NotFound, GeneralError,
} = require('../middleware/error');

const router = express.Router();
const jsonParser = bodyParser.json();

/**
 * Create a club
 */
router.post('/club/create', jsonParser, async (req, res, next) => {
  const newClubFields = {};
  const socialsObject = {};

  try {
    if (req.body.name) {
      newClubFields.name = req.body.name;
      const newSlug = slugify(req.body.name, { lower: true });
      newClubFields.slug = newSlug;
    } else throw new BadRequest('Missing required field: Name');
    if (req.body.instagram) socialsObject.instagram = req.body.instagram;
    if (req.body.google_classroom_code) {
      socialsObject.google_classroom_code = req.body.google_classroom_code;
    }
    if (req.body.signup_link) socialsObject.signup_link = req.body.signup_link;
    if (req.body.description) {
      if (req.body.description.length < 150) newClubFields.description = req.body.description;
      else throw new BadRequest('Character limit exceeded');
    } else throw new BadRequest('Missing required field: Description');

    if (req.body.clubfest_link) newClubFields.clubfest_link = req.body.clubfest_link;

    if (socialsObject.google_classroom_code
      || socialsObject.instagram || socialsObject.signup_link) {
      newClubFields.socials = socialsObject;
    }

    newClubFields.events = 0;
    newClubFields.posts = 0;

    const clubExists = await Club.exists({ slug: newClubFields.slug });

    if (clubExists !== null) throw new Conflict('Resource Conflict: Name is taken already');
    else {
      Club.create(newClubFields, (err, club) => {
        if (err) throw new GeneralError(`${err}`, `${err}`);
        else res.status(201).send(club);
      });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * Delete a club by their slug
 */
router.delete('/club/slug/:slug/delete', jsonParser, async (req, res, next) => {
  const filterSlug = req.params.slug;
  try {
    Club.findOneAndDelete({ slug: filterSlug }, (err, club) => {
      if (err) {
        throw new BadRequest('Bad Request', `${err}`);
      } else if (club === null) throw new NotFound(`Not found: ${filterSlug}`);
      else res.status(200).send(club);
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Filter clubs through id
 */
router.get('/club/id/:id', jsonParser, async (req, res, next) => {
  const filterId = req.params.id;
  try {
    Club.find({ _id: mongoose.mongo.ObjectId(filterId) }, (err, club) => {
      if (!err) {
        res.status(200).send(club);
      } else {
        throw new BadRequest('Bad Request', `${err}`);
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Filter clubs through their slug
 */
router.get('/club/slug/:slug', jsonParser, async (req, res, next) => {
  const filterSlug = req.params.slug;
  try {
    Club.find({ slug: filterSlug }, (err, club) => {
      if (err) throw new BadRequest('Bad Request', `${err}`);
      else if (club.length === 0) {
        throw new NotFound(`Not found: ${filterSlug}`);
      } else res.status(200).send(club);
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Retrieve all clubs
 */
router.get('/all', jsonParser, async (req, res, next) => {
  try {
    Club.find({}, (err, clubs) => {
      if (!err) {
        res.status(200).send(clubs);
      } else {
        throw new BadRequest('Bad Request', `${err}`);
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Updates a club object
 *
 *
 * Does NOT update teacher or execs. Those go through a separate endpoint
 */
router.put('/club/slug/:slug/update', jsonParser, async (req, res, next) => {
  const filterSlug = req.params.slug;
  const updateFields = {};
  const socialsObject = {};
  try {
    if (req.body.name) {
      updateFields.name = req.body.name;
      const newSlug = slugify(req.body.name, { lower: true });
      updateFields.slug = newSlug;
    }
    if (req.body.instagram) socialsObject.instagram = req.body.instagram;
    if (req.body.google_classroom_code) {
      socialsObject.google_classroom_code = req.body.google_classroom_code;
    }
    if (req.body.signup_link) socialsObject.signup_link = req.body.signup_link;
    if (req.body.description) updateFields.description = req.body.description;
    if (req.body.clubfest_link) updateFields.clubfest_link = req.body.clubfest_link;

    if (socialsObject.google_classroom_code
      || socialsObject.instagram || socialsObject.signup_link) {
      updateFields.socials = socialsObject;
    }

    Club.findOneAndUpdate({ slug: filterSlug }, updateFields, { new: true }, (err, club) => {
      if (err) throw new GeneralError(`${err}`, `${err}`);
      else if (club === null) throw new NotFound(`Not found: ${filterSlug}`);
      else {
        res.status(200).send(club);
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * endpoint to update club execs
 *
 * adds club execs
 */
router.put('/club/slug/:slug/executives/add', jsonParser, async (req, res, next) => {
  const filterSlug = req.params.slug;
  let updateFieldExecutive;
  try {
    if (req.body.executive) updateFieldExecutive = req.body.executive;
    Club.findOneAndUpdate(
      { slug: filterSlug },
      { $addToSet: { execs: updateFieldExecutive } },
      { new: true },
      (err, club) => {
        if (err) {
          throw new BadRequest('Bad Request', `${err}`);
        } else if (club === null) throw new NotFound(`Not found: ${filterSlug}`);
        else res.status(200).send(club);
      },
    );
  } catch (err) {
    next(err);
  }
});

/**
 * endpoint to update club teacher
 *
 * adds club teachers
 */
router.put('/club/slug/:slug/teacher/add', jsonParser, async (req, res, next) => {
  const filterSlug = req.params.slug;
  let updateFieldTeacher;
  if (req.body.teacher) updateFieldTeacher = req.body.teacher;
  try {
    Club.findOneAndUpdate(
      { slug: filterSlug },
      { $addToSet: { teachers: updateFieldTeacher } },
      { new: true },
      (err, club) => {
        if (err) {
          throw new BadRequest('Bad Request', `${err}`);
        } else if (club === null) throw new NotFound(`Not found: ${filterSlug}`);
        else res.status(200).send(club);
      },
    );
  } catch (err) {
    next(err);
  }
});

/**
 * delete club execs
 */
router.delete('/club/slug/:slug/executives/delete', jsonParser, async (req, res, next) => {
  const filterSlug = req.params.slug;
  let updateFieldExecutive;
  if (req.body.executive) updateFieldExecutive = req.body.executive;
  try {
    Club.findOneAndUpdate(
      { slug: filterSlug },
      { $pull: { execs: updateFieldExecutive } },
      { new: true },
      (err, club) => {
        if (err) {
          throw new BadRequest('Bad Request', `${err}`);
        } else if (club === null) throw new NotFound(`Not found: ${filterSlug}`);
        else res.status(200).send(club);
      },
    );
  } catch (err) {
    next(err);
  }
});

/**
 * delete club teachers
 */
router.delete('/club/slug/:slug/teachers/delete', jsonParser, async (req, res, next) => {
  const filterSlug = req.params.slug;
  let updateFieldTeacher;
  if (req.body.teacher) updateFieldTeacher = req.body.teacher;
  try {
    Club.findOneAndUpdate(
      { slug: filterSlug },
      { $pull: { teachers: updateFieldTeacher } },
      { new: true },
      (err, club) => {
        if (err) {
          throw new BadRequest('Bad Request', `${err}`);
        } else if (club === null) throw new NotFound(`Not found: ${filterSlug}`);
        else res.status(200).send(club);
      },
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;
