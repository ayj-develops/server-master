const express = require('express');
const bodyParser = require('body-parser');
const Post = require('../models/post.model');
const Comment = require('../models/comment.model');
const { checkExist } = require('../utils/exist');
const { getUser, getPost, getClub } = require('../utils/queries');
const {
  BadRequest, NotFound, Forbidden, GeneralError,
} = require('../middleware/error');

const router = express.Router();
const jsonParser = bodyParser.json();

// GET /api/v0/post/club/:id
router.get('/club/:id', (req, res, next) => {
  try {
    Post.find({ club: req.params.id })
      .then((posts) => {
        res.status(200).json(posts);
      })
      .catch((err) => {
        throw new NotFound('not_found', `Club ${req.params.id} not found: ${err}`);
      });
  } catch (err) {
    next(err);
  }
});

// GET /api/post/:id
router.get('/:id', (req, res, next) => {
  try {
    Post.findById(req.params.id)
      .then((post) => {
        if (post) {
          res.status(200).json(post);
        } else {
          throw new NotFound('not_found', `Post ${req.params.id} not found`);
        }
      })
      .catch((err) => {
        throw new NotFound('not_found', `Post ${req.params.id} not found: ${err}`);
      });
  } catch (err) {
    next(err);
  }
});

// GET /api/v0/post/:id/comments
router.get('/:id/comments', (req, res, next) => {
  try {
    Post.findById(req.params.id)
      .then((post) => {
        if (post) {
          res.status(200).json(post.comments);
        } else {
          throw new NotFound('not_found', `Post ${req.params.id} not found`);
        }
      })
      .catch((err) => {
        throw new NotFound('not_found', `Post ${req.params.id} not found: ${err}`);
      });
  } catch (err) {
    next(err);
  }
});

// POST /api/v0/post/create
router.post('/create', jsonParser, async (req, res, next) => {
  const newPostFields = {};

  try {
    if (checkExist(req.body.title)) { newPostFields.title = req.body.title; } else { throw new BadRequest('bad_request', 'Title is required'); }

    if (checkExist(req.body.body)) {
      if (req.body.body.length > 5000) {
        throw new BadRequest('bad_request', 'Body is too long');
      } else newPostFields.body = req.body.body;
    }

    const user = await getUser('email', req.body.author);
    if (checkExist(user)) {
      if (checkExist(user)) newPostFields.author = user.email;
      else throw new NotFound('not_found', 'User not found');
    } else throw new BadRequest('bad_request', 'Author is required');

    const club = await getClub('name', req.body.club);
    if (checkExist(club)) {
      if (club.members.filter((members) => members === req.body.author) === undefined) throw new Forbidden('forbidden', 'User is not a member of the club');
      else newPostFields.club = club.name;
    } else throw new NotFound('not_found', 'Club not found');

    if (req.body.flairs) newPostFields.flairs = req.body.flairs;

    newPostFields.likes = 0;

    if (req.body.attachment) newPostFields.attachment = req.body.attachment;

    Post.create(newPostFields, (err, post) => {
      if (err) throw new GeneralError('server_error', `${err}`);
      else {
        user.addToSet(post._id);
        user.save().then(() => {
          res.status(201).send({ ok: 'true', post });
        }).catch((nextErr) => {
          throw new GeneralError('server_error', `${nextErr}`);
        });
      }
    });
  } catch (err) {
    next(err);
  }
});

router.put('/:id/edit', jsonParser, async (req, res, next) => {
  const updatedPostFields = {};
  try {
    if (!checkExist(req.params.id)) { throw new BadRequest('bad_request', 'Post is required'); }
    if (!checkExist(req.body.author)) { throw new BadRequest('bad_request', 'Author is required'); }
    if (checkExist(req.body.title)
      || checkExist(req.body.body) || checkExist(req.body.attachment)) {
      updatedPostFields.title = req.body.title;
      updatedPostFields.body = req.body.body;
      updatedPostFields.attachment = req.body.attachment;
    } else throw new BadRequest('bad_request', 'Title, body or attachment is required');

    const user = await getUser('email', req.body.author);
    const post = await getPost('_id', req.params.id);

    if (checkExist(user)) {
      if (checkExist(post)) {
        if (post.author === user.email) {
          post.set(updatedPostFields);
          post.save().then(() => {
            res.status(200).send({ ok: 'true', post });
          }).catch((err) => {
            throw new GeneralError(`${err}`, `${err}`);
          });
        } else throw new Forbidden('forbidden', 'User is not the author of the post');
      } else throw new NotFound('not_found', 'Post not found');
    } else throw new NotFound('not_found', 'User not found');
  } catch (err) {
    next(err);
  }
});

router.put('/:id/favorite', jsonParser, async (req, res, next) => {
  try {
    if (!checkExist(req.params.id)) { throw new BadRequest('bad_request', 'Post is required'); }
    if (!checkExist(req.body.user)) { throw new BadRequest('bad_request', 'User is required'); }

    const post = await getPost('_id', req.params.id);
    const user = await getUser('email', req.body.user);

    if (checkExist(post)) {
      if (checkExist(user)) {
        if (user.fav_posts.indexOf(post._id) === -1) {
          user.addToSet({ fav_posts: post._id });
          user.save().then(() => {
            res.status(200).send({ ok: 'true', post });
          }).catch((err) => {
            throw new GeneralError(`${err}`, `${err}`);
          });
        } else throw new Forbidden('forbidden', 'Post is already in favorites');
      } else throw new NotFound('not_found', 'User not found');
    } else throw new NotFound('not_found', 'Post not found');
  } catch (err) {
    next(err);
  }
});

router.put('/:id/unfavorite', jsonParser, async (req, res, next) => {
  try {
    if (!checkExist(req.body.user)) throw new BadRequest('bad_request', 'User is required');
    if (!checkExist(req.params.id)) throw new BadRequest('bad_request', 'Post is required');

    const user = await getUser('email', req.body.user);
    const post = await getPost('_id', req.params.id);

    if (checkExist(user)) {
      if (checkExist(post)) {
        if (user.fav_posts.indexOf(post._id) === -1) {
          throw new Forbidden('forbidden', 'Post is not in favorites');
        } else {
          user.pull({ fav_posts: post._id });
          user.save().then(() => {
            res.status(200).send({ ok: 'true', post });
          }).catch((err) => {
            throw new GeneralError(`${err}`, `${err}`);
          });
        }
      } else throw new NotFound('not_found', 'Post not found');
    } else throw new NotFound('not_found', 'User not found');
  } catch (err) {
    next(err);
  }
});

router.put('/:id/like', jsonParser, async (req, res, next) => {
  try {
    if (!checkExist(req.params.id)) { throw new BadRequest('bad_request', 'Post is required'); }
    if (!checkExist(req.body.user)) { throw new BadRequest('bad_request', 'User is required'); }

    const post = await getPost('_id', req.params.id);
    const user = await getUser('email', req.body.user);

    if (checkExist(post)) {
      if (checkExist(user)) {
        if (user.liked.indexOf(post._id) === -1) {
          user.addToSet({ liked: post._id });
          user.save().then(() => {
            post.likes += 1;
            post.save().then(() => {
              res.status(200).send({ ok: 'true', post });
            }).catch((err) => {
              throw new GeneralError(`${err}`, `${err}`);
            });
          }).catch((err) => {
            throw new GeneralError(`${err}`, `${err}`);
          });
        } else throw new Forbidden('forbidden', 'Post is already liked');
      } else throw new NotFound('not_found', 'User not found');
    } else throw new NotFound('not_found', 'Post not found');
  } catch (err) {
    next(err);
  }
});

router.put('/:id/unlike', jsonParser, async (req, res, next) => {
  try {
    if (!checkExist(req.params.id)) { throw new BadRequest('bad_request', 'Post is required'); }
    if (!checkExist(req.body.user)) { throw new BadRequest('bad_request', 'User is required'); }

    const post = await getPost('_id', req.params.id);
    const user = await getUser('email', req.body.user);

    if (checkExist(post)) {
      if (checkExist(user)) {
        if (user.liked.indexOf(post._id) === -1) {
          throw new Forbidden('forbidden', 'Post is not liked');
        } else {
          user.pull({ liked: post._id });
          user.save().then(() => {
            post.likes -= 1;
            post.save().then(() => {
              res.status(200).send({ ok: 'true', post });
            }).catch((err) => {
              throw new GeneralError(`${err}`, `${err}`);
            });
          }).catch((err) => {
            throw new GeneralError(`${err}`, `${err}`);
          });
        }
      } else throw new NotFound('not_found', 'User not found');
    } else throw new NotFound('not_found', 'Post not found');
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', jsonParser, async (req, res, next) => {
  try {
    if (!checkExist(req.params.id)) throw new BadRequest('bad_request', 'Post is required');
    if (!checkExist(req.body.author)) throw new BadRequest('bad_request', 'Author is required');

    const post = await getPost('_id', req.params.id);
    const user = await getUser('email', req.body.author);

    if (checkExist(post)) {
      if (checkExist(user)) {
        if (post.author === user.email) {
          const club = await getClub('name', post.club);
          club.pull({ posts: post._id });
          club.save().then(() => {
            // eslint-disable-next-line no-plusplus
            for (let i = 0; i < post.comments.length; i++) {
              Comment.findByIdAndRemove(post.comments[i], (err) => {
                if (err) throw new GeneralError(`${err}`, `${err}`);
              });
            }
            post.remove().then(() => {
              res.status(200).send({ ok: 'true' });
            }).catch((err) => {
              throw new GeneralError(`${err}`, `${err}`);
            });
          }).catch((err) => {
            throw new GeneralError(`${err}`, `${err}`);
          });
        } else throw new Forbidden('forbidden', 'User is not the author of the post');
      } else throw new NotFound('not_found', 'User not found');
    } else throw new NotFound('not_found', 'Post not found');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
