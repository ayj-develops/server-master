const express = require('express');
const bodyParser = require('body-parser');
const { default: slugify } = require('slugify');
const { default: mongoose } = require('mongoose');
const Post = require('../models/post.model');
const {
  BadRequest, GeneralError, Conflict, NotFound,
} = require('../middleware/error');
const { checkExist } = require('./exist');

const router = express.Router();
const jsonParser = bodyParser.json();

/** create new post */
router.post('/create', jsonParser, async (req, res, next) => {
  const newPostFields = {};

  try {
    if (req.body.title) {
      newPostFields.title = req.body.title;
      const slug = slugify(req.body.title, { lower: true });
      newPostFields.slug = slug;
    } else throw new BadRequest('Missing required field: Title');
    if (req.body.body) newPostFields.body = req.body.body;
    if (req.body.author) {
      newPostFields.author = req.body.author;
    } else throw new BadRequest('Missing required field: Author');
    if (req.body.image) newPostFields.image = req.body.image;
    if (req.body.club) {
      newPostFields.club = req.body.club;
    } else throw new BadRequest('Missing required field: Club');

    const postExists = await Post.exists({ slug: newPostFields.slug });
    if (postExists !== null) throw new Conflict('Resource Conflict: This post already exists.');
    else {
      Post.create(newPostFields, (err, post) => {
        if (err) throw new GeneralError(`${err}`, `${err}`);
        else res.status(201).send(post);
      });
    }
  } catch (err) {
    next(err);
  }
});

router.get('/slug/:slug', jsonParser, async (req, res, next) => {
  const filterSlug = req.params.slug;
  try {
    Post.find({ slug: filterSlug }, (err, post) => {
      if (!err) {
        res.status(200).send(post);
      } else {
        throw new BadRequest('Bad Request', `${err}`);
      }
    });
  } catch (err) { next(err); }
});

router.get('/id/:id', jsonParser, async (req, res, next) => {
  const filterId = req.params.id;
  try {
    Post.find({ _id: mongoose.mongo.ObjectId(filterId) }, (err, post) => {
      if (!err) {
        res.status(200).send(post);
      } else {
        throw new BadRequest('Bad Request', `${err}`);
      }
    });
  } catch (err) { next(err); }
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

module.exports = router;
