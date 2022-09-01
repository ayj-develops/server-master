const express = require('express');

const router = express.Router();
const Club = require('../models/club.model');
const { BadRequest, NotFound, GeneralError } = require('../middleware/error');
const { checkExist } = require('../utils/exist');
const { slugit } = require('../utils/stringUtils');
const User = require('../models/user.model');

// GET /api/v0/clubs/
router.get('/', (req, res, next) => {
  Club.find()
    .then((clubs) => {
      res.status(200).json({ ok: 'true', clubs });
    })
    .catch((err) => {
      next(err);
    });
});

// GET /api/v0/clubs/:id/members
router.get('/:id/members', (req, res, next) => {
  Club.find()
    .then((clubs) => {
      res.status(200).json({ ok: 'true', members: [clubs.members] });
    })
    .catch((err) => {
      next(err);
    })
})

// GET /api/v0/clubs/:id/executives
router.get('/:id/executives', (req, res, next) => {
  Club.find()
    .then((clubs) => {
      res.status(200).json({ ok: 'true', executives: [clubs.execs] });
    })
    .catch((err) => {
      next(err);
    })
})

// POST /api/v0/clubs/create
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

  if (!checkExist(clubName) || !checkExist(clubDescription) || !checkExist(clubTeacher)) {
    throw new BadRequest('bad_parameter', 'Missing required fields');
  }

  const socialsObject = {};

  const clubSlug = slugit(clubName.toString());

  const clubObject = {
    name: clubName,
    slug: clubSlug,
    description: clubDescription,
    socials: socialsObject,
    clubfest_link: clubClubfestLink,
    teacher: clubTeacher,
  };

  if (checkExist(clubInstagram)
    || checkExist(clubGoogleClasroomCode) || checkExist(clubSignupLink)) {
    clubObject.socials = {
      instagram: clubInstagram,
      google_classroom_code: clubGoogleClasroomCode,
      signup_link: clubSignupLink,
    };
  }

  if (clubDescription.length < 10 || clubDescription.length > 500) {
    throw new BadRequest('exceeded_char', 'Description must be between 10 and 500 characters');
  } else {
    Club.create(clubObject)
      .then((club) => {
        res.status(200).json({
          ok: 'true',
          club,
        });
      }).catch((err) => {
        next(err);
      });
  }
});

// clubs/:id
router.get('/:id', (req, res, next) => {
  try {
    Club.findById(req.params.id)
      .then((club) => {
        res.status(200).json(club);
      })
      .catch((err) => {
        throw new NotFound('not_found', `Club ${req.params.id} not found: ${err}`);
      });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v0/clubs/:id/update
router.put('/:id/update', (req, res, next) => {
  try {
    const {
      name: clubName,
      description: clubDescription,
      instagram: clubInstagram,
      google_classroom_code: clubGoogleClasroomCode,
      signup_link: clubSignupLink,
      clubfest_link: clubClubfestLink,
      teacher: clubTeacher,
    } = req.body;

    if (!checkExist(clubName) || !checkExist(clubDescription) || !checkExist(clubTeacher)) {
      throw new BadRequest('bad_parameter', 'Missing required fields');
    }
    const socialsObject = {};
    const clubSlug = slugit(clubName);
    const clubObject = {
      name: clubName,
      slug: clubSlug,
      description: clubDescription,
      socials: socialsObject,
      clubfest_link: clubClubfestLink,
      teacher: clubTeacher,
    };
    if (checkExist(clubInstagram)
      || checkExist(clubGoogleClasroomCode) || checkExist(clubSignupLink)) {
      clubObject.socials = {
        instagram: clubInstagram || Club.findOne({ _id: req.params.id }).socials.instagram,
        google_classroom_code: clubGoogleClasroomCode
          || Club.findOne({ _id: req.params.id }).socials.google_classroom_code,
        signup_link: clubSignupLink || Club.findOne({ _id: req.params.id }).socials.signup_link,
      };
    }
    if (clubDescription.length < 50 || clubDescription.length > 500) {
      throw new BadRequest('exceeded_char', 'Description must be between 50 and 500 characters');
    } else {
      Club.findByIdAndUpdate(req.params.id, clubObject, { new: true })
        .then((club) => {
          res.status(200).json({ ok: 'true', club });
        }).catch((err) => {
          throw new GeneralError('server_error', `Server error: ${err}`);
        });
    }
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v0/clubs/:id/delete
router.delete('/:id/delete', (req, res, next) => {
  try {
    Club.findByIdAndRemove(req.params.id)
      .then((club) => {
        res.status(200).json({ ok: 'true', club });
      }).catch((err) => {
        throw new NotFound('not_found', `Club ${req.params.id} not found: ${err}`);
      });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v0/clubs/:id/executives/new
router.put('/:id/executives/new', (req, res, next) => {
  try {
    const {
      id: executiveId,
    } = req.body;
    console.log(executiveId);
    if (!checkExist(executiveId)) {
      throw new BadRequest('bad_parameter', 'Missing required fields: id');
    }
    Club.findById(req.params.id)
      .then((club) => {
        club.execs.push(executiveId);
        club.save()
          .then((updatedClub) => {
            res.status(200).json({ ok: 'true', updatedClub });
          }).catch((err) => {
            throw new GeneralError('server_error', `Server error: ${err}`);
          });
      }).catch((err) => {
        throw new NotFound('not_found', `Club ${req.params.id} not found: ${err}`);
      });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v0/clubs/:id/executives/delete
router.put('/:id/executives/delete', (req, res, next) => {
  try {
    const {
      id: executiveId,
    } = req.body;
    if (!checkExist(executiveId)) {
      throw new BadRequest('bad_parameter', 'Missing required fields: id');
    }
    Club.findById(req.params.id)
      .then((club) => {
        club.executives.pull(executiveId);
        club.save()
          .then((updatedClub) => {
            res.status(200).json({ ok: 'true', updatedClub });
          }).catch((err) => {
            throw new GeneralError('server_error', `Server error: ${err}`);
          });
      }).catch((err) => {
        throw new NotFound('not_found', `Club ${req.params.id} not found: ${err}`);
      });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v0/clubs/:id/members/add
router.put('/:id/members/add', (req, res, next) => {
  try {
    const {
      id: memberId,
    } = req.body;
    if (!checkExist(memberId)) {
      throw new BadRequest('bad_parameter', 'Missing required fields: id');
    }
    Club.findById(req.params.id)
      .then((club) => {
        club.members.push(memberId);
        club.save()
          .then((updatedClub) => {
            res.status(200).json({ ok: 'true', updatedClub });
          }).catch((err) => {
            throw new GeneralError('server_error', `Server error: ${err}`);
          });
      }).catch((err) => {
        throw new NotFound('not_found', `Club ${req.params.id} not found: ${err}`);
      });
    User.findById(memberId)
      .then((user) => {
        user.clubs.push(req.params.id);
        user.save()
          .then((updatedUser) => {
            res.status(200).json({ ok: 'true', updatedUser });
          }).catch((err) => {
            throw new GeneralError('server_error', `Server error: ${err}`);
          });
      }).catch((err) => {
        throw new NotFound('not_found', `User ${memberId} not found: ${err}`);
      });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v0/clubs/:id/members/delete
router.put('/:id/members/delete', (req, res, next) => {
  try {
    const {
      id: memberId,
    } = req.body;
    if (!checkExist(memberId)) {
      throw new BadRequest('bad_parameter', 'Missing required fields: id');
    }
    Club.findById(req.params.id)
      .then((club) => {
        club.members.pull(memberId);
        club.save()
          .then((updatedClub) => {
            res.status(200).json({ ok: 'true', updatedClub });
          }).catch((err) => {
            throw new GeneralError('server_error', `Server error: ${err}`);
          });
      }).catch((err) => {
        throw new NotFound('not_found', `Club ${req.params.id} not found: ${err}`);
      });
    User.findById(memberId)
      .then((user) => {
        user.clubs.pull(req.params.id);
        user.save()
          .then((updatedUser) => {
            res.status(200).json({ ok: 'true', updatedUser });
          }).catch((err) => {
            throw new GeneralError('server_error', `Server error: ${err}`);
          });
      }).catch((err) => {
        throw new NotFound('not_found', `User ${memberId} not found: ${err}`);
      });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v0/clubs/:id/favourite
router.put('/:id/favourite', (req, res, next) => {
  try {
    const {
      id: userId,
    } = req.body;
    if (!checkExist(userId)) {
      throw new BadRequest('bad_parameter', 'Missing required fields: id');
    }
    User.findById(userId)
      .then((user) => {
        user.favourite_clubs.push(req.params.id);
        user.save()
          .then((updatedUser) => {
            res.status(200).json({ ok: 'true', updatedUser });
          }).catch((err) => {
            throw new GeneralError('server_error', `Server error: ${err}`);
          });
      }).catch((err) => {
        throw new NotFound('not_found', `User ${userId} not found: ${err}`);
      });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v0/clubs/:id/unfavourite
router.put('/:id/unfavourite', (req, res, next) => {
  try {
    const {
      id: userId,
    } = req.body;
    if (!checkExist(userId)) {
      throw new BadRequest('bad_parameter', 'Missing required fields: id');
    }
    User.findById(userId)
      .then((user) => {
        user.favourite_clubs.pull(req.params.id);
        user.save()
          .then((updatedUser) => {
            res.status(200).json({ ok: 'true', updatedUser });
          }).catch((err) => {
            throw new GeneralError('server_error', `Server error: ${err}`);
          });
      }).catch((err) => {
        throw new NotFound('not_found', `User ${userId} not found: ${err}`);
      });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
