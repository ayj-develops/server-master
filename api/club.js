const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const slugit = require('../utils/stringUtils');
const {
  BadRequest, Conflict, GeneralError, NotFound, Forbidden,
} = require('../middleware/error');
const Club = require('../models/club.model');
const { getClub, getUser } = require('../utils/queries');
const { checkExist } = require('../utils/exist');

const router = express.Router();
const jsonParser = bodyParser.json();

//
// Create, Update and Delete a Club
//

/** Creates a club object */
router.post('/create', jsonParser, async (req, res, next) => {
  const newClubFields = {};
  const socialsObject = {};

  // body fields
  const {
    name: clubName,
    description: clubDescription,
    instagram: clubInstagram,
    google_classroom_code: clubGoogleClasroomCode,
    signup_link: clubSignupLink,
    clubfest_link: clubClubfestLink,
    teacher: clubTeacher,
  } = req.body;

  try {
    if (checkExist(clubName)) {
      newClubFields.name = clubName;
      const newSlug = slugit(clubName);
      newClubFields.slug = newSlug;
    } else throw new BadRequest('Missing required field: Name');

    if (checkExist(clubDescription)) {
      if (clubDescription.length < 150) newClubFields.description = clubDescription;
      else throw new BadRequest(`Character limit exceeded: ${clubDescription.length}`);
    } else throw new BadRequest('Missing required field: Description');

    if (checkExist(clubClubfestLink)) newClubFields.clubfest_link = clubClubfestLink;
    if (checkExist(clubInstagram)) socialsObject.instagram = clubInstagram;

    if (checkExist(clubSignupLink)) socialsObject.signup_link = clubSignupLink;
    if (checkExist(clubGoogleClasroomCode)) {
      socialsObject.google_classroom_code = clubGoogleClasroomCode;
    }
    if (checkExist(clubTeacher)) {
      newClubFields.teacher = clubTeacher;
    } else throw new BadRequest('Missing required field: Teacher');

    if (socialsObject.google_classroom_code
      || socialsObject.signup_link || socialsObject.clubInstagram) {
      newClubFields.socials = socialsObject;
    }

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

/** Get club by id */
router.get('/:id', jsonParser, async (req, res, next) => {
  try {
    await getClub('_id', req.params.id).then((e) => {
      if (e.code === 500) {
        throw new GeneralError(`${e.message}`);
      } else if (e.code === 404) {
        throw new NotFound(`${e.message}`);
      } else res.status(200).send(e);
    });
  } catch (err) {
    next(err);
  }
});

/** Get club by slug */
router.get('/:slug', jsonParser, async (req, res, next) => {
  try {
    await getClub('slug', req.params.slug).then((e) => {
      if (e.code === 500) {
        throw new GeneralError(`${e.message}`);
      } else if (e.code === 404) {
        throw new NotFound(`${e.message}`);
      } else res.status(200).send(e);
    });
  } catch (err) {
    next(err);
  }
});

/** Get all clubs */
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

/** Update a club's basic information through id */
router.put('/:id/update', jsonParser, async (req, res, next) => {
  const updateClubFields = {};

  const clubId = req.params.id;

  // body fields
  const {
    name: clubName,
    description: clubDescription,
    socials: clubSocialsObject,
  } = req.body;

  try {
    if (checkExist(clubName)) {
      updateClubFields.name = clubName;
      const newSlug = slugit(clubName);
      updateClubFields.slug = newSlug;
    } else throw new BadRequest('Missing required field: Name');

    if (checkExist(clubDescription)) {
      if (clubDescription.length < 150) updateClubFields.description = clubDescription;
      else throw new BadRequest(`Character limit exceeded: ${clubDescription.length}`);
    } else throw new BadRequest('Missing required field: Description');

    if (clubSocialsObject.google_classroom_code
      || clubSocialsObject.signup_link || clubSocialsObject.clubInstagram) {
      updateClubFields.socials = clubSocialsObject;
    }

    Club.findOneAndUpdate(
      { _id: mongoose.mongo.ObjectId(clubId) },
      updateClubFields,
      { new: true },
      (err, club) => {
        if (err) throw new GeneralError(`${err}`);
        else if (club === null) throw new NotFound(`Not found: ${clubId}`);
        else res.status(200).send(club);
      },
    );
  } catch (err) {
    next(err);
  }
});

/** Update a club's basic information through slug */
router.put('/:slug/update', jsonParser, async (req, res, next) => {
  const updateClubFields = {};

  const clubSlug = req.params.slug;

  // body fields
  const {
    name: clubName,
    description: clubDescription,
    socials: clubSocialsObject,
  } = req.body;

  try {
    if (checkExist(clubName)) {
      updateClubFields.name = clubName;
      const newSlug = slugit(clubName);
      updateClubFields.slug = newSlug;
    }

    if (checkExist(clubDescription)) {
      if (clubDescription.length < 150) updateClubFields.description = clubDescription;
      else throw new BadRequest(`Character limit exceeded: ${clubDescription.length}`);
    }

    if (clubSocialsObject.google_classroom_code
      || clubSocialsObject.signup_link || clubSocialsObject.clubInstagram) {
      updateClubFields.socials = clubSocialsObject;
    }

    Club.findOneAndUpdate(
      { slug: clubSlug },
      updateClubFields,
      { new: true },
      (err, club) => {
        if (err) throw new GeneralError(`${err}`);
        else if (club === null) throw new NotFound(`Not found: ${clubSlug}`);
        else res.status(200).send(club);
      },
    );
  } catch (err) {
    next(err);
  }
});

/** Delete club through id */
router.delete('/:id/delete', jsonParser, async (req, res, next) => {
  const clubId = req.params.id;
  try {
    Club.findOneAndDelete({ _id: mongoose.mongo.ObjectId(clubId) }, (err, club) => {
      if (err) {
        throw new GeneralError(`${err}`);
      } else if (club === null) throw new NotFound(`Not found: ${clubId}`);
      else res.status(200).send(club);
    });
  } catch (err) {
    next(err);
  }
});

/** Delete club through slug */
router.delete('/:slug/delete', jsonParser, async (req, res, next) => {
  const clubSlug = req.params.slug;
  try {
    Club.findOneAndDelete({ slug: clubSlug }, (err, club) => {
      if (err) {
        throw new GeneralError(`${err}`);
      } else if (club === null) throw new NotFound(`Not found: ${clubSlug}`);
      else res.status(200).send(club);
    });
  } catch (err) {
    next(err);
  }
});

//
// Specific fields to update
//

/** Add a new executive to a club through slug */
router.post('/:slug/executives/add', jsonParser, async (req, res, next) => {
  const clubSlug = req.params.slug;
  const { executive: clubExecutive } = req.body;

  try {
    if (checkExist(clubExecutive)) {
      Club.findOneAndUpdate(
        { slug: clubSlug },
        { $addToSet: { execs: clubExecutive } },
        { new: true },
        (err, club) => {
          if (err) {
            throw new BadRequest('Bad Request', `${err}`);
          } else if (club === null) throw new NotFound(`Not found: ${clubSlug}`);
          else res.status(200).send(club);
        },
      );
    }
  } catch (err) {
    next(err);
  }
});

/** Add a new executive to a club through id */
router.post('/:id/executives/add', jsonParser, async (req, res, next) => {
  const clubId = req.params.id;
  const { executive: clubExecutive } = req.body;

  try {
    if (checkExist(clubExecutive)) {
      Club.findOneAndUpdate(
        { _id: mongoose.mongo.ObjectId(clubId) },
        { $addToSet: { execs: clubExecutive } },
        { new: true },
        (err, club) => {
          if (err) {
            throw new BadRequest('Bad Request', `${err}`);
          } else if (club === null) throw new NotFound(`Not found: ${clubId}`);
          else res.status(200).send(club);
        },
      );
    }
  } catch (err) {
    next(err);
  }
});

/** Delete an executive through club slug */
router.delete('/:slug/executives/remove', jsonParser, async (req, res, next) => {
  const clubSlug = req.params.slug;

  const { executive: clubExecutive } = req.body;

  try {
    if (checkExist(clubExecutive)) {
      Club.findOneAndUpdate(
        { slug: clubSlug },
        { $pull: { execs: clubExecutive } },
        { new: true },
        (err, club) => {
          if (err) {
            throw new BadRequest('Bad Request', `${err}`);
          } else if (club === null) throw new NotFound(`Not found: ${clubSlug}`);
          else res.status(200).send(club);
        },
      );
    }
  } catch (err) {
    next(err);
  }
});

/** Delete an executive through club id */
router.delete('/:id/executives/remove', jsonParser, async (req, res, next) => {
  const clubId = req.params.id;

  const { executive: clubExecutive } = req.body;

  try {
    if (!checkExist(clubExecutive)) {
      Club.findOneAndUpdate(
        { _id: mongoose.mongo.ObjectId(clubId) },
        { $pull: { execs: clubExecutive } },
        { new: true },
        (err, club) => {
          if (err) {
            throw new BadRequest('Bad Request', `${err}`);
          } else if (club === null) throw new NotFound(`Not found: ${clubId}`);
          else res.status(200).send(club);
        },
      );
    }
  } catch (err) {
    next(err);
  }
});

/** Change teacher name from club slug */
router.post('/:slug/teacher/update', jsonParser, async (req, res, next) => {
  const clubSlug = req.params.slug;
  const { teacher: clubTeacher } = req.body;

  try {
    if (checkExist(clubTeacher)) {
      Club.findOneAndUpdate(
        { slug: clubSlug },
        { teacher: clubTeacher },
        { new: true },
        (err, club) => {
          if (err) {
            throw new GeneralError(`${err}`);
          } else if (club === null) {
            throw new NotFound(`Not found: ${clubSlug}`);
          } else res.status(200).send(club);
        },
      );
    }
  } catch (err) {
    next(err);
  }
});

/** Change teacher name from club id */
router.post('/:id/teachers/update', jsonParser, async (req, res, next) => {
  const clubId = req.params.id;
  const { teacher: clubTeacher } = req.body;

  try {
    if (checkExist(clubTeacher)) {
      Club.findOneAndUpdate(
        { _id: mongoose.mongo.ObjectId(clubId) },
        { teacher: clubTeacher },
        { new: true },
        (err, club) => {
          if (err) {
            throw new GeneralError(`${err}`);
          } else if (club === null) {
            throw new NotFound(`Not found: ${clubId}`);
          } else res.status(200).send(club);
        },
      );
    }
  } catch (err) {
    next(err);
  }
});

/** add a club member from club slug */
router.post('/:slug/members/add', jsonParser, async (req, res, next) => {
  const clubSlug = req.params.slug;
  const { member: newMember } = req.body;

  try {
    if (checkExist(newMember)) {
      Club.findOneAndUpdate(
        { _id: mongoose.mongo.ObjectId(clubSlug) },
        { $addToSet: { members: newMember } },
        { new: true },
        (err, club) => {
          if (err) {
            throw new BadRequest('Bad Request', `${err}`);
          } else if (club === null) throw new NotFound(`Not found: ${clubSlug}`);
          else res.status(200).send(club);
        },
      );
    }
  } catch (err) {
    next(err);
  }
});

/** add a club member from club id */
router.post('/:id/members/add', jsonParser, async (req, res, next) => {
  const clubId = req.params.id;
  const { member: newMember } = req.body;

  try {
    if (checkExist(newMember)) {
      Club.findOneAndUpdate(
        { _id: mongoose.mongo.ObjectId(clubId) },
        { $addToSet: { members: newMember } },
        { new: true },
        (err, club) => {
          if (err) {
            throw new BadRequest('Bad Request', `${err}`);
          } else if (club === null) throw new NotFound(`Not found: ${clubId}`);
          else res.status(200).send(club);
        },
      );
    }
  } catch (err) {
    next(err);
  }
});

/** delete a club member from club slug */
router.delete('/:slug/members/remove', jsonParser, async (req, res, next) => {
  const clubSlug = req.params.slug;
  const { member: newMember } = req.body;

  try {
    if (checkExist(newMember)) {
      Club.findOneAndUpdate(
        { _id: mongoose.mongo.ObjectId(clubSlug) },
        { $pull: { members: newMember } },
        { new: true },
        (err, club) => {
          if (err) {
            throw new BadRequest('Bad Request', `${err}`);
          } else if (club === null) throw new NotFound(`Not found: ${clubSlug}`);
          else res.status(200).send(club);
        },
      );
    }
  } catch (err) {
    next(err);
  }
});

/** delete club member from club slug */
router.delete('/:id/members/remove', jsonParser, async (req, res, next) => {
  const clubId = req.params.id;
  const { member: newMember } = req.body;

  try {
    if (checkExist(newMember)) {
      Club.findOneAndUpdate(
        { _id: mongoose.mongo.ObjectId(clubId) },
        { $pull: { members: newMember } },
        { new: true },
        (err, club) => {
          if (err) {
            throw new BadRequest('Bad Request', `${err}`);
          } else if (club === null) throw new NotFound(`Not found: ${clubId}`);
          else res.status(200).send(club);
        },
      );
    }
  } catch (err) {
    next(err);
  }
});

/** update socials object through club slug */
router.put('/:slug/socials/update', jsonParser, async (req, res, next) => {
  const clubSlug = req.params.slug;
  const socialsObject = {};

  const {
    instagram: clubInstagram,
    signup_link: clubSignupLink,
    google_classroom_code: clubGoogleClasroomCode,
  } = req.body;

  try {
    if (checkExist(clubSignupLink)) socialsObject.signup_link = clubSignupLink;
    if (checkExist(clubInstagram)) socialsObject.instagram = clubInstagram;
    if (checkExist(clubGoogleClasroomCode)) {
      socialsObject.google_classroom_code = clubGoogleClasroomCode;
    }

    Club.findOneAndUpdate(
      { slug: clubSlug },
      { socials: socialsObject },
      { new: true },
      (err, club) => {
        if (err) {
          throw new BadRequest('Bad Request', `${err}`);
        } else if (club === null) throw new NotFound(`Not found: ${clubSlug}`);
        else res.status(200).send(club);
      },
    );
  } catch (err) {
    next(err);
  }
});
/** update socials object through club id */
router.put('/:id/socials/update', jsonParser, async (req, res, next) => {
  const clubId = req.params.id;
  const socialsObject = {};

  const {
    instagram: clubInstagram,
    signup_link: clubSignupLink,
    google_classroom_code: clubGoogleClasroomCode,
  } = req.body;

  try {
    if (checkExist(clubSignupLink)) socialsObject.signup_link = clubSignupLink;
    if (checkExist(clubInstagram)) socialsObject.instagram = clubInstagram;
    if (checkExist(clubGoogleClasroomCode)) {
      socialsObject.google_classroom_code = clubGoogleClasroomCode;
    }

    Club.findOneAndUpdate(
      { slug: clubId },
      { socials: socialsObject },
      { new: true },
      (err, club) => {
        if (err) {
          throw new BadRequest('Bad Request', `${err}`);
        } else if (club === null) throw new NotFound(`Not found: ${clubId}`);
        else res.status(200).send(club);
      },
    );
  } catch (err) {
    next(err);
  }
});

/** Add flair to club */
router.put('/add-flair', jsonParser, async (req, res, next) => {
  try {
    const { admin, flair, club } = req.body;
    if (!checkExist(admin)) throw new BadRequest('Missing required field: admin');
    else if (!checkExist(flair)) throw new BadRequest('Missing required field: flair');
    else if (!checkExist(club)) throw new BadRequest('Missing required field: club');
    else {
      const user = await getUser('_id', admin);
      if (checkExist(user)) {
        const tmpClub = await getClub('_id', club);
        if (checkExist(tmpClub)) {
          if (checkExist(tmpClub.execs.find(admin)) || tmpClub.teacher === admin) {
            if (checkExist(tmpClub.flairs.find(flair))) throw new Conflict('Resource conflict: flair already exists');
            else {
              tmpClub.flairs.addToSet(flair);
              tmpClub.save().then(() => { res.status(200).json({ Message: 'Success' }); })
                .catch((err) => { throw new GeneralError(`${err}`, `${err}`); });
            }
          } else throw new Forbidden('You are not authorized to make this operation');
        } else throw new NotFound('Club not found');
      } else throw new NotFound('User not found');
    }
  } catch (err) { next(err); }
});
/** Delete a flair from a club */
router.post('/delete-flair', jsonParser, async (req, res, next) => {
  const { admin: adminUser, flair: clubFlair, club: clubId } = req.body;

  try {
    if (!checkExist(adminUser)) throw new BadRequest('Missing required field: admin');
    else if (!checkExist(clubFlair)) throw new BadRequest('Missing required field: flair');
    else if (!checkExist(clubId)) throw new BadRequest('Missing required field: club');
    else {
      const user = await getUser('_id', adminUser);
      if (checkExist(user)) {
        const club = await getClub('_id', clubId);
        if (checkExist(club)) {
          if (checkExist(club.execs.find(adminUser)) || club.teacher === adminUser) {
            club.flairs.pull(clubFlair);
            club.save().then(() => { res.status(200).json({ message: 'Success' }); })
              .catch((err) => { throw new GeneralError(`${err}`); });
          } else throw new Forbidden('You are not authorized to make this operation');
        } else throw new NotFound('Club not found');
      } else throw new NotFound('User not found');
    }
  } catch (err) {
    next(err);
  }
});

//
// Interactions
//

// NEEDS TESTING

router.put('/follow', jsonParser, async (req, res, next) => {
  try {
    const { clubID, userID } = req.body;
    if (!checkExist(clubID)) {
      throw new BadRequest('Missing required field: clubID');
    } else if (!checkExist(userID)) {
      throw new BadRequest('Missing required field: userID');
    } else {
      const user = await getUser('_id', userID);
      if (checkExist(user)) {
        const club = await getClub('_id', clubID);
        if (checkExist(club)) {
          console.log(club);
          club.members.addToSet(userID);
          club.save().then(() => {
            user.clubs.addToSet(clubID);
            user.save().then(() => {
              res.status(200).json({ Message: 'Success' });
            })
              .catch((err) => { throw new GeneralError(`${err}`, `${err}`); });
          })
            .catch((err) => { throw new GeneralError(`${err}, ${err}`); });
        } else {
          throw new NotFound('Club not found');
        }
      } else {
        throw new NotFound('User not found');
      }
    }
  } catch (err) {
    next(err);
  }
});

router.put('/unfollow', jsonParser, async (req, res, next) => {
  try {
    const { userID, clubID } = req.body;
    if (!checkExist(userID)) {
      throw new BadRequest('Missing required field: userID');
    } else if (!checkExist(clubID)) {
      throw new BadRequest('Missing required field: clubID');
    } else {
      const user = await getUser('_id', userID);
      if (checkExist(user)) {
        const club = await getClub('_id', clubID);
        if (checkExist(club)) {
          club.members.pull(userID);
          club.save().then(() => {
            user.clubs.pull(clubID);
            user.save().then(() => {
              res.status(200).json({ Message: 'Success' });
            })
              .catch((err) => { throw new GeneralError(`${err}, ${err}`); });
          })
            .catch((err) => { throw new GeneralError(`${err}, ${err}`); });
        } else {
          res.status(404).json('Club not found');
        }
      } else {
        res.status(404).json('User not found');
      }
    }
  } catch (err) { next(err); }
});

router.put('/favorite', jsonParser, async (req, res, next) => {
  try {
    const { userID, clubID } = req.body;

    if (!checkExist(userID)) throw new BadRequest('Missing required field: userID');
    else if (!checkExist(clubID)) throw new BadRequest('Missing required field: clubID');

    else {
      const user = await getUser('_id', userID);
      if (checkExist(user)) {
        const club = await getClub('_id', clubID);
        if (checkExist(club)) {
          user.favorite_clubs.addToSet(clubID);
          user.save().then(() => {
            res.status(200).json({ Message: 'Success' });
          })
            .catch((err) => { throw new GeneralError(`${err} , ${err}`); });
        } else throw new NotFound('Club not found');
      } else throw new NotFound('User not found');
    }
  } catch (err) { next(err); }
});

router.put('/unfavorite', jsonParser, async (req, res, next) => {
  try {
    const { userID, clubID } = req.body;

    if (!checkExist(userID)) throw new BadRequest('Missing required field: userID');
    else if (!checkExist(clubID)) throw new BadRequest('Missing required field: clubID');

    else {
      const user = await getUser('_id', userID);
      if (checkExist(user)) {
        const club = await getClub('_id', clubID);
        if (checkExist(club)) {
          user.favorite_clubs.pull(clubID);
          user.save().then(() => {
            res.status(200).json({ Message: 'Success' });
          })
            .catch((err) => { throw new GeneralError(`${err} , ${err}`); });
        } else throw new NotFound('Club not found');
      } else throw new NotFound('User not found');
    }
    const user = await getUser('_id', userID);
  } catch (err) { next(err); }
});

module.exports = router;
