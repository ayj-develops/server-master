const express = require('express');
const bodyParser = require('body-parser');
const { default: mongoose } = require('mongoose');
const { default: slugify } = require('slugify');
const Club = require('../models/club.model');
const User = require('../models/user.model');
const { getUser, getClub } = require('./miscallenous');
const {
  BadRequest, Conflict, NotFound, GeneralError, Unauthorized, Forbidden
} = require('../middleware/error');
const { checkExist } = require('./exist');

const router = express.Router();
const jsonParser = bodyParser.json();

/**
 * Create a club
 */
router.post('/create', jsonParser, async (req, res, next) => {
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

    if (checkExist(req.body.teacher)) {
      const teacher = await getUser('_id', req.body.teacher);
      if (teacher.account_type !== 'teacher') throw new Unauthorized('Only teachers are allowed to take this role');
      else newClubFields.teacher = req.body.teacher;
    }
    else throw new BadRequest('Missing required field: Teacher');

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
router.delete('/slug/:slug/delete', jsonParser, async (req, res, next) => {
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
router.get('/slug/:slug', jsonParser, async (req, res, next) => {
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
router.put('/slug/:slug/update', jsonParser, async (req, res, next) => {
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
router.put('/slug/:slug/executives/add', jsonParser, async (req, res, next) => {
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











// NEEDS TESTING





router.put('/follow', jsonParser, async (req, res, next) => {
  try {
    const {clubID, userID} = req.body;
    if (!checkExist(clubID)) {
      throw new BadRequest('Missing required field: clubID');
    }
    else if (!checkExist(userID)) {
      throw new BadRequest('Missing required field: userID')
    }
    else {
      const user = await getUser('_id', userID);
      if (checkExist(user)) {
        const club = await getClub('_id', clubID);
        if (checkExist(club)) {
          console.log(club)
          club.members.addToSet(userID);
          club.save().then(() => {
            user.clubs.addToSet(clubID);
            user.save().then(() => {
              res.status(200).json({Message: "Success"});
            })
            .catch((err) => {throw new GeneralError(`${err}`, `${err}`)});
          })
          .catch((err) => {throw new GeneralError(`${err}, ${err}`)});
        }
        else {
          throw new NotFound('Club not found');
        }
      }
      else {
        throw new NotFound('User not found')
      }
    }
  }
  catch (err) {
    next(err);
  }
})

router.put('/unfollow', jsonParser, async (req,res, next) => {
  try {
    const {userID, clubID} = req.body;
    if (!checkExist(userID)) {
      throw new BadRequest('Missing required field: userID');
    }
    else if (!checkExist(clubID)) {
      throw new BadRequest('Missing required field: clubID');
    }
    else {
      const user = await getUser('_id', userID);
      if (checkExist(user)) {
        const club = await getClub('_id', clubID);
        if (checkExist(club)) {
          club.members.pull(userID);
          club.save().then(() => {
            user.clubs.pull(clubID);
            user.save().then(() => {
              res.status(200).json({Message: "Success"});
            })
            .catch((err) => {throw new GeneralError(`${err}, ${err}`)})
          })
          .catch((err) => {throw new GeneralError(`${err}, ${err}`)});
        }
        else {
          res.status(404).json('Club not found');
        }
      }
      else {
        res.status(404).json('User not found');
      }
    }
  }
  catch(err) {next(err)}
})


router.put('/favorite', jsonParser, async (req, res, next) => {
  try {
    const {userID, clubID} = req.body;
    
    if (!checkExist(userID)) throw new BadRequest('Missing required field: userID');
    else if (!checkExist(clubID)) throw new BadRequest('Missing required field: clubID');

    else {
      const user = await getUser('_id', userID);
      if (checkExist(user)) {
        const club = await getClub('_id', clubID);
        if (checkExist(club)) {
          user.favorite_clubs.addToSet(clubID);
          user.save().then(() => {
            res.status(200).json({Message: "Success"});
          })
          .catch((err) => {throw new GeneralError(`${err} , ${err}`)})
        }
        else throw new NotFound('Club not found');
      }
      else throw new NotFound('User not found');
    }
  }
  catch (err) {next(err)};
});

router.put('/unfavorite', jsonParser, async (req, res, next) => {
  try {
    const {userID, clubID} = req.body;
    
    if (!checkExist(userID)) throw new BadRequest('Missing required field: userID');
    else if (!checkExist(clubID)) throw new BadRequest('Missing required field: clubID');

    else {
      const user = await getUser('_id', userID);
      if (checkExist(user)) {
        const club = await getClub('_id', clubID);
        if (checkExist(club)) {
          user.favorite_clubs.pull(clubID);
          user.save().then(() => {
            res.status(200).json({Message: "Success"});
          })
          .catch((err) => {throw new GeneralError(`${err} , ${err}`)})
        }
        else throw new NotFound('Club not found');
      }
      else throw new NotFound('User not found');
    }
    const user = await getUser('_id', userID)
  }
  catch (err) {next(err)};
})

router.put('/add-flair', jsonParser, async (req, res, next) => {
  try {
    const {admin, flair, club} = req.body;
    if (!checkExist(admin)) throw new BadRequest('Missing required field: admin');
    else if (!checkExist(flair)) throw new BadRequest('Missing required field: flair');
    else if (!checkExist(club)) throw new BadRequest('Missing required field: club');
    else {
      const user = await getUser('_id', admin);
      if (checkExist(user)) {
        const tmpClub = await getClub('_id', club);
        if (checkExist(tmpClub)) {
          if (checkExist(tmpClub.execs.find(admin)) || tmpClub.teacher===admin) {
            if (checkExist(tmpClub.flairs.find(flair))) throw new Conflict('Resource conflict: flair already exists');
            else {
              tmpClub.flairs.addToSet(flair);
              tmpClub.save().then(() => {res.status(200).json({Message: "Success"})})
              .catch((err) => {throw new GeneralError(`${err}`, `${err}`)})
            }
          }
          else throw new Forbidden('You are not authorized to this operation');
        }
        else throw new NotFound('Club not found');
      }
      else throw new NotFound('User not found');
    }
  }
  catch(err) {next(err)}
})


module.exports = router;
