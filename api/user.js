const express = require('express');

const router = express.Router();
const User = require('../models/user.model');
const Comment = require('../models/comment.model');
const Post = require('../models/post.model');
const { checkExist } = require('../utils/exist');

const { NotFound, BadRequest } = require('../middleware/error');

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
      profile_pic: userProfilePic,
    } = req.body;
    let newUserAccountType = userAccountType || 'student';
    if (!checkExist(userEmail)) {
      throw new BadRequest('bad_parameter', 'Missing parameters: email');
    }
    if (userEmail.endsWith('@student.tdsb.on.ca')) {
      newUserAccountType = 'student';
    } else if (userEmail.endsWith('@tdsb.on.ca')) {
      newUserAccountType = 'teacher';
    } else {
      throw new BadRequest('bad_parameter', 'Invalid email');
    }
    const newUser = await User.findOneAndUpdate({}, {
      email: userEmail,
      account_type: newUserAccountType,
      profile_pic: userProfilePic,
    }, { upsert: true, new: true });
    res.json({ ok: 'true', newUser });
  } catch (err) {
    next(err);
  }
});

// GET /api/v0/users/user
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new NotFound('user_not_found', 'User not found');
    }
    res.json({ ok: 'true', user });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v0/users/delete
router.delete('/delete', async (req, res, next) => {
  try {
    const { email } = req.params;
    if (!checkExist(email)) {
      throw new BadRequest('bad_parameter', 'Missing parameter: email');
    }
    const user = await User.find({ email });
    if (!checkExist(user)) {
      throw new NotFound('user_not_found', `User not found with email: ${email}`);
    } else {
      await User.findOneAndDelete({ email });
      res.json({ ok: 'true', message: `User with id: ${email} deleted` });
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/v0/users/comments
router.get('/comments', async (req, res, next) => {
  try {
    const { email } = req.params;
    if (!checkExist(email)) {
      throw new BadRequest('bad_parameter', 'Missing parameter: email');
    }
    const user = await User.find({ email });
    if (!checkExist(user)) {
      throw new NotFound('user_not_found', `User not found with email: ${email}`);
    } else {
      const comments = await Comment.find({ author: user._id });
      res.json({ ok: 'true', comments });
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/v0/users/favourites
router.get('/favourites', async (req, res, next) => {
  try {
    const { email } = req.params;
    if (!checkExist(email)) {
      throw new BadRequest('bad_parameter', 'Missing parameter: email');
    }
    const user = await User.find({ email });
    if (!checkExist(user)) {
      throw new NotFound('user_not_found', `User not found with email: ${email}`);
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
router.get('/posts', async (req, res, next) => {
  try {
    const { email } = req.params;
    if (!checkExist(email)) {
      throw new BadRequest('bad_parameter', 'Missing parameter: email');
    }
    const user = await User.find({ email });
    if (!checkExist(user)) {
      throw new NotFound('user_not_found', `User not found with email: ${email}`);
    } else {
      const posts = await Post.find({ author: user._id });
      res.json({ ok: 'true', posts });
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/v0/users/liked
router.get('/liked', async (req, res, next) => {
  try {
    const { email } = req.params;
    let commentsResponse = [];
    let postsResponse = [];
    let commentsWorked = false;
    let postsWorked = false;
    if (!checkExist(email)) {
      throw new BadRequest('bad_parameter', 'Missing parameter: email');
    }
    const user = await User.find({ email });
    if (!checkExist(user)) {
      throw new NotFound('user_not_found', `User not found with id: ${email}`);
    } else {
      const { type } = req.query;
      if (!checkExist(type)) {
        throw new BadRequest('bad_parameter', 'Missing parameter: type');
      }
      if (type === 'comments') {
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
