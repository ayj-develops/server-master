const express = require('express');

const router = express.Router();
const User = require('../models/user.model');
const Comment = require('../models/comment.model');
const Post = require('../models/post.model');
const { checkExist } = require('../utils/exist');

const { NotFound, BadRequest, Conflict } = require('../middleware/error');

// GET /api/v0/users/
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find();
    res.json({ ok: 'true', users });
  } catch (err) {
    next(err);
  }
});

// POST /api/v0/users/create
router.post('/create', async (req, res, next) => {
  try {
    const {
      email: userEmail,
      account_type: userAccountType,
      clubs: userClubs,
    } = req.body;
    let newUserAccountType = userAccountType || 'student';
    if (!checkExist(userEmail) || !checkExist(userClubs)) {
      throw new BadRequest('bad_parameter', 'Missing parameters: email, clubs');
    }
    if (userEmail.endsWith('@student.tdsb.on.ca')) {
      newUserAccountType = 'student';
    } else if (userEmail.endsWith('@tdsb.on.ca')) {
      newUserAccountType = 'teacher';
    } else {
      throw new BadRequest('Invalid email');
    }
    const user = await User.findOne({ email: userEmail });
    if (user) {
      next(new Conflict('parameter_taken', `User already exists with email: ${userEmail}`));
    } else {
      const newUser = await User.create({
        email: userEmail,
        account_type: newUserAccountType,
        clubs: userClubs,
      });
      res.json({ ok: 'true', newUser });
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/v0/users/:id/
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!checkExist(id)) {
      throw new BadRequest('bad_parameter', 'Missing parameter: id');
    }
    const user = await User.findById(id);
    if (!checkExist(user)) {
      throw new NotFound('user_not_found', `User not found with id: ${id}`);
    } else {
      res.json({ ok: 'true', user });
    }
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v0/users/:id/delete
router.delete('/:id/delete', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!checkExist(id)) {
      throw new BadRequest('bad_parameter', 'Missing parameter: id');
    }
    const user = await User.findById(id);
    if (!checkExist(user)) {
      throw new NotFound('user_not_found', `User not found with id: ${id}`);
    } else {
      await User.findByIdAndDelete(id);
      res.json({ ok: 'true', message: `User with id: ${id} deleted` });
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/v0/users/:id/comments
router.get('/:id/comments', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!checkExist(id)) {
      throw new BadRequest('bad_parameter', 'Missing parameter: id');
    }
    const user = await User.findById(id);
    if (!checkExist(user)) {
      throw new NotFound('user_not_found', `User not found with id: ${id}`);
    } else {
      const comments = await Comment.find({ author: id });
      res.json({ ok: 'true', comments });
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/v0/users/:id/favourites
router.get('/:id/favourites', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!checkExist(id)) {
      throw new BadRequest('bad_parameter', 'Missing parameter: id');
    }
    const user = await User.findById(id);
    if (!checkExist(user)) {
      throw new NotFound('user_not_found', `User not found with id: ${id}`);
    } else {
      const { type } = req.query;
      if (!checkExist(type)) {
        const favourites = user.favourite_clubs.concat(user.fav_posts);
        res.json({ ok: 'true', favourites });
      } else if (type === 'posts') {
        const favourites = user.fav_posts;
        res.json({ ok: 'true', favourites });
      } else if (type === 'clubs') {
        const favourites = user.favourite_clubs;
        res.json({ ok: 'true', favourites });
      } else {
        throw new BadRequest('bad_parameter', 'Invalid parameter: type');
      }
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/v0/users/:id/posts
router.get('/:id/posts', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!checkExist(id)) {
      throw new BadRequest('bad_parameter', 'Missing parameter: id');
    }
    const user = await User.findById(id);
    if (!checkExist(user)) {
      throw new NotFound('user_not_found', `User not found with id: ${id}`);
    } else {
      const posts = await Post.find({ author: id });
      res.json({ ok: 'true', posts });
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/v0/users/:id/liked
router.get('/:id/liked', async (req, res, next) => {
  try {
    const { id } = req.params;
    let commentsResponse = [];
    let postsResponse = [];
    let commentsWorked = false;
    let postsWorked = false;
    if (!checkExist(id)) {
      throw new BadRequest('bad_parameter', 'Missing parameter: id');
    }
    const user = await User.findById(id);
    if (!checkExist(user)) {
      throw new NotFound('user_not_found', `User not found with id: ${id}`);
    } else {
      const { type } = req.query;
      if (!checkExist(type)) {
        throw new BadRequest('bad_parameter', 'Missing parameter: type');
      }
      if (type === 'comments') {
        // get all comments that the user liked from the user's liked array
        const likedComments = await Comment.find({ _id: { $in: user.liked } });
        if (checkExist(likedComments)) {
          commentsResponse = likedComments;
          commentsWorked = true;
        }
      } else if (type === 'posts') {
        const likedPosts = await Post.find({ _id: { $in: user.liked } });
        if (checkExist(likedPosts)) {
          postsResponse = likedPosts;
          postsWorked = true;
        }
      } else {
        throw new BadRequest('bad_parameter', 'Invalid parameter: type');
      }
      if (commentsWorked && postsWorked) {
        res.json({ ok: 'true', comments: commentsResponse, posts: postsResponse });
      } else {
        throw new NotFound('not_found', `No liked ${type} found`);
      }
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
