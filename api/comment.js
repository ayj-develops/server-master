/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
const express = require('express');

const router = express.Router();
const Comment = require('../models/comment.model');
const User = require('../models/user.model');
const {
  GeneralError, BadRequest, Conflict, NotFound,
} = require('../middleware/error');
const { checkExist } = require('../utils/exist');
const Post = require('../models/post.model');

// GET /api/v0/comments/
router.get('/', (req, res, next) => {
  try {
    Comment.find()
      .then((comments) => {
        res.json({ ok: 'true', comments });
      })
      .catch((err) => {
        throw new GeneralError('server_error', `Server error: ${err}`);
      });
  } catch (err) {
    throw new GeneralError('server_error', `Server error: ${err.message}`);
  }
});

// GET /api/v0/comments/:id
router.get('/:id', (req, res, next) => {
  try {
    Comment.findById(req.params.id)
      .then((comment) => {
        res.json({ ok: 'true', comment });
      })
      .catch((err) => {
        throw new GeneralError('server_error', `Server error: ${err}`);
      });
  } catch (err) {
    throw new GeneralError('server_error', `Server error: ${err.message}`);
  }
});

router.post('/:id/add', (req, res, next) => {
  try {
    Post.findById(req.params.id)
      .then((post) => {
        const newCommentFields = {
          body: req.body.body,
          author: req.body.body,
          parentPost: req.params.id,
          parent: req.body.parent
        }
        if (post.children.indexOf(req.body.parent) === -1) {
          throw new NotFound('not_found', `Comment ${req.body.parent} not found`);
        }
        else {
          Comment.create(newCommentFields, (err, comment) => {
            if (err) {
              throw new Conflict('conflict', `Comment ${req.body.parent} already exists`);
            }
            post.comments.push(comment);
            post.save();
            res.json({ ok: 'true', comment });
          })
        }
      })
      .catch((err) => {
        throw new GeneralError('server_error', `Server error: ${err}`);
      })
  } catch (err) {
    throw new GeneralError('server_error', `Server error: ${err.message}`);
  }
})

// PUT /api/v0/comments/:id/update
router.put('/:id/update', (req, res, next) => {
  try {
    if (!checkExist(req.body.body)) {
      throw new BadRequest('bad_parameter', 'Body field is empty');
    }
    Comment.findByIdAndUpdate(req.params.id, { body: req.body.body })
      .then((comment) => {
        res.json({ ok: 'true', comment });
      }).catch((err) => {
        throw new GeneralError('server_error', `Server error: ${err}`);
      });
  } catch (err) {
    throw new GeneralError('server_error', `Server error: ${err.message}`);
  }
});

// PUT /api/v0/comments/:id/like
router.put('/:id/like', (req, res, next) => {
  const { id: userId } = req.body;
  try {
    let commentWorked = false;
    let userWorked = false;
    let commentResponse;
    let userResponse;
    Comment.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } })
      .then((comment) => {
        commentWorked = true;
        commentResponse = comment;
      }).catch((err) => {
        throw new GeneralError('server_error', `Server error: ${err}`);
      });
    // check if user has comment in likes array
    User.findById(userId)
      .then((user) => {
        userWorked = true;
        userResponse = user;
        if (user.liked.includes(req.params.id)) {
          throw new Conflict('parameter_taken', 'User has already liked this comment');
        }
        user.liked.push(req.params.id);
        user.save();
      }).catch((err) => {
        throw new GeneralError('server_error', `Server error: ${err}`);
      });
    if (commentWorked && userWorked) {
      res.json({ ok: 'true', comment: commentResponse, user: userResponse });
    } else {
      throw new GeneralError('server_error', 'Something went wrong');
    }
  } catch (err) {
    throw new GeneralError('server_error', `Server error: ${err.message}`);
  }
});

// PUT /api/v0/comments/:id/unlike
router.put('/:id/unlike', (req, res, next) => {
  const { id: userId } = req.body;
  try {
    let commentWorked = false;
    let userWorked = false;
    let commentResponse;
    let userResponse;
    Comment.findByIdAndUpdate(req.params.id, { $inc: { likes: -1 } })
      .then((comment) => {
        commentWorked = true;
        commentResponse = comment;
      }).catch((err) => {
        throw new GeneralError('server_error', `Server error: ${err}`);
      });
    User.findById(userId)
      .then((user) => {
        userWorked = true;
        userResponse = user;
        if (!user.liked.includes(req.params.id)) {
          throw new Conflict('parameter_taken', 'User has not liked this comment');
        }
        user.liked.splice(user.liked.indexOf(req.params.id), 1);
        user.save();
      }).catch((err) => {
        throw new GeneralError('server_error', `Server error: ${err}`);
      });
    if (commentWorked && userWorked) {
      res.json({ ok: 'true', comment: commentResponse, user: userResponse });
    } else {
      throw new GeneralError('server_error', 'Something went wrong');
    }
  } catch (err) {
    throw new GeneralError('server_error', `Server error: ${err.message}`);
  }
});

// DELETE /api/v0/comments/:id/delete
router.delete('/:id/delete', (req, res, next) => {
  try {
    Comment.findById(req.params.id)
      .then((comment) => {
        if (!checkExist(comment)) {
          throw new NotFound('not_found', `Comment not found: ${req.params.id}`);
        }
        comment.deletedMessage = comment.body;
        comment.body = 'This comment has been deleted';
        comment.save()
          .then((updatedComment) => {
            res.json({ ok: 'true', updatedComment });
          }).catch((err) => {
            throw new GeneralError('server_error', `Server error: ${err}`);
          });
      }).catch((err) => {
        throw new GeneralError('server_error', `Server error: ${err}`);
      });
  } catch (err) {
    throw new GeneralError('server_error', `Server error: ${err.message}`);
  }
});

module.exports = router;
