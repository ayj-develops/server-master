const express = require('express');
const bodyParser = require('body-parser');
const hash = require('object-hash');
const mongoose = require('mongoose');
const { checkExist } = require('../utils/exist');
const Post = require('../models/post.model');
const User = require('../models/user.model');
const { getUser, getPost, getClub } = require('../utils/queries');
const {
  BadRequest, NotFound, Forbidden, GeneralError, Conflict,
} = require('../middleware/error');

const router = express.Router();
const jsonParser = bodyParser.json();

router.post('/create', jsonParser, async (req, res, next) => {
  const newPostFields = {};

  try {
    if (checkExist(req.body.title)) newPostFields.title = req.body.title;
    else throw new BadRequest('Missing required field: title');

    if (checkExist(req.body.body)) {
      if (req.body.body.length > 500) {
        throw new BadRequest('Post body exceeded character limit');
      } else {
        newPostFields.body = req.body.body;
      }
    }
    const user = await getUser('_id', req.body.author);
    if (checkExist(req.body.author)) {
      if (checkExist(user)) newPostFields.author = user._id;
      else throw new NotFound('User not found');
    } else throw new BadRequest('Missing required field: author');

    const club = await getClub('_id', req.body.club);
    if (checkExist(req.body.club)) {
      if (checkExist(club)) {
        if (club.members.filter((members) => members === req.body.author) === undefined) throw new Forbidden('This user is not authorized to post within this club');
        else newPostFields.club = club._id;
      } else throw new NotFound('Club not found');
    }

    if (checkExist(req.body.flair)) {
      if (!club.flairs.find(req.body.flair) === undefined) newPostFields.flair = req.body.flair;
    }

    newPostFields.likes = 0;

    if (checkExist(req.body.flairs)) newPostFields.flairs = req.body.flairs;
    if (checkExist(req.body.attachment)) newPostFields.attachment = req.body.attachment;

    Post.create(newPostFields, (err, post) => {
      if (err) throw new GeneralError(`${err}`, `${err}`);
      else {
        user.posts.addToSet(post._id);
        user.save().then(() => { res.status(201).send({ Message: 'Success' }); })
          .catch((err) => { throw new GeneralError(`${err}`, `${err}`); });
      }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/', jsonParser, async (req, res) => {
  if (!checkExist(req.query._id)) res.status(200).send(await Post.find());
  else {
    const { _id } = req.body;
    Post.findById({ _id }, (err, post) => {
      console.log(post);
      if (err) res.status(500).send({ Message: 'Error' });
      else if (post === null) res.status(400).send({ Message: 'Post not found' });
      else {
        res.status(200).send(post);
      }
    });
  }
});

router.delete('/delete', jsonParser, async (req, res) => {
  const { _id } = req.body;
  if (!checkExist(_id)) {
    res.status(400).send({ Message: 'ID params are missing' });
  } else if (!checkExist(req.body.author)) {
    res.status(400).send({ Message: 'Author params are missing' });
  } else {
    const author = hash(req.body.author, { algorithm: 'sha1' });
    Post.findById({ _id }, (err, post) => {
      if (err) {
        res.status(500).send({ Message: 'Error' });
      } else if (post === null) {
        res.status(400).send({ Message: 'Post not found' });
      } else if (post.author !== author) {
        res.status(400).send({ Message: 'You are not OP' });
      } else {
        throw new BadRequest('Bad Request', `${err}`);
      }
    });
  }
});

router.delete('/delete', jsonParser, async (req, res) => {
  const { _id } = req.body;
  if (_id === null) {
    res.status(400).send({ Message: 'ID params are missing' });
  } else if (req.body.author === null) {
    res.status(400).send({ Message: 'Author params are missing' });
  } else {
    const author = hash(req.body.author, { algorithm: 'sha1' });
    Post.findById({ _id }, (err, post) => {
      if (err) {
        res.status(500).send({ Message: 'Error' });
      } else if (post === null) {
        res.status(400).send({ Message: 'Post not found' });
      } else if (post.author !== author) {
        res.status(400).send({ Message: 'You are not OP' });
      } else {
        throw new BadRequest('Bad Request', `${err}`);
      }
    });
  }
});

/**
 * Delete club through :slug
 */
router.delete('/slug/:slug/delete', jsonParser, async (req, res, next) => {
  const filterSlug = req.params.slug;
  try {
    Post.findOneAndDelete({ slug: filterSlug }, (err, post) => {
      if (err) {
        throw new BadRequest('Bad Request', `${err}`);
      } else if (!checkExist(post)) throw new NotFound(`Not found: ${filterSlug}`);
      else res.status(200).send(post);
    });
  } catch (err) { next(err); }
});

/**
 * update post by fetching through id
 */
router.put('/id/:id/update', jsonParser, async (req, res, next) => {
  const filterId = req.params.id;
  const updateFields = {};

  try {
    if (req.body.title) {
      updateFields.title = req.body.title;
      const slug = slugify(req.body.title, { lower: true });
      updateFields.slug = slug;
    }
    if (req.body.body) updateFields.body = req.body.body;
    if (req.body.author) updateFields.author = req.body.author;
    if (req.body.image) updateFields.image = req.body.image;
    if (req.body.club) updateFields.club = req.body.club;

    Post.findOneAndUpdate(
      { _id: mongoose.mongo.ObjectId(filterId) },
      updateFields,
      { new: true },
      (err, club) => {
        if (err) throw new GeneralError(`${err}`, `${err}`);
        else if (checkExist(club)) throw new NotFound(`Not found: ${filterId}`);
        else {
          res.status(200).send(club);
        }
      },
    );
  } catch (err) { next(err); }
});

/**
 * update post by fetching through slug
 */
router.put('/slug/:slug/update', jsonParser, async (req, res, next) => {
  const filterSlug = req.params.id;
  const updateFields = {};

  try {
    if (req.body.title) {
      updateFields.title = req.body.title;
      const slug = slugify(req.body.title, { lower: true });
      updateFields.slug = slug;
    }
    if (req.body.body) updateFields.body = req.body.body;
    if (req.body.author) updateFields.author = req.body.author;
    if (req.body.image) updateFields.image = req.body.image;
    if (req.body.club) updateFields.club = req.body.club;

    Post.findOneAndUpdate(
      { slug: filterSlug },
      updateFields,
      { new: true },
      (err, club) => {
        if (err) throw new GeneralError(`${err}`, `${err}`);
        else if (checkExist(club)) throw new NotFound(`Not found: ${filterSlug}`);
        else {
          res.status(200).send(club);
        }
      },
    );
  } catch (err) { next(err); }
});

router.put('/favorite', jsonParser, async (req, res, next) => {
  try {
    const { userID, postID } = req.body;

    if (!checkExist(userID)) throw new BadRequest('Missing required field: userID');
    else if (!checkExist(postID)) throw new BadRequest('Missing required field: clubID');

    else {
      const user = await getUser('_id', userID);
      if (checkExist(user)) {
        const post = await getPost('_id', postID);
        if (checkExist(post)) {
          user.fav_posts.addToSet(postID);
          user.save().then(() => {
            res.status(200).json({ Message: 'Success' });
          })
            .catch((err) => { throw new GeneralError(`${err} , ${err}`); });
        } else throw new NotFound('Post not found');
      } else throw new NotFound('User not found');
    }
  } catch (err) { next(err); }
});

router.put('/unfavorite', jsonParser, async (req, res, next) => {
  try {
    const { userID, postID } = req.body;

    if (!checkExist(userID)) throw new BadRequest('Missing required field: userID');
    else if (!checkExist(postID)) throw new BadRequest('Missing required field: postID');
    else {
      const user = await getUser('_id', userID);
      if (checkExist(user)) {
        const post = await getPost('_id', postID);
        if (checkExist(post)) {
          user.fav_posts.pull(postID);
          user.save().then(() => { res.status(200).json({ Message: 'Success' }); })
            .catch((err) => { throw new GeneralError(`${err}, ${err}`); });
        } else throw new NotFound('Post not found');
      } else throw new NotFound('User not found');
    }
  } catch (err) { next(err); }
});

module.exports = router;
