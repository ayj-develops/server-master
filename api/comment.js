const express = require('express');
const bodyParser = require('body-parser');
const { checkExist } = require('../utils/exist');
const { BadRequest, GeneralError } = require('../middleware/error');
const Comment = require('../models/comment.model');

const router = express.Router();
const jsonParser = bodyParser.json();

/** create a new comment */
router.post('/create', jsonParser, async (req, res, next) => {
  const {
    author: userId,
    post: postId,
    body: commentBody,
    parent: parentCommentId,
  } = req.body;

  try {
    if (!checkExist(userId)) throw new BadRequest('Missing required field: author');
    if (!checkExist(commentBody)) throw new BadRequest('Missing required field: body');

    let _parentCommentId = null;
    if (checkExist(parentCommentId)) _parentCommentId = parentCommentId;
    const newComment = new Comment({
      author: userId,
      postParent: postId,
      body: commentBody,
      parent: _parentCommentId,
    });

    newComment.save().then(() => {
      res.status(201).send(newComment);
    }).catch((err) => {
      if (err) throw new GeneralError('Server Error', `Error: ${err}`);
    });
  } catch (err) {
    next(err);
  }
});

/** deletes a comment (only obscures public facing comment) */
router.delete('/delete', jsonParser, async (req, res, next) => {
  const {
    user_id: userId,
    comment: commentId,
  } = req.body;

  // TODO: Secure with role based permissions (only ADMIN can delete, excludes club execs)

  try {
    const currCommentBody = Comment.findOne({ _id: commentId }).body;

    Comment.findOneAndUpdate(
      { _id: commentId },
      { body: 'This comment has been deleted', deletedMessage: currCommentBody },
      { new: true },
      (err, comment) => {
        if (err) throw new GeneralError('Server Error', `${err}`);
        else {
          res.status(200).send(comment);
        }
      },
    );
  } catch (err) {
    next(err);
  }
});

/** retrieve comments from post */
router.get('/', jsonParser, async (req, res, next) => {
  const { post: postId } = req.body;

  const postComments = [];

  try {
    if (!checkExist(postId)) throw new BadRequest('Missing required field: post');
    Comment.find({ post_parent: postId }, (err, comments) => {
      if (err) throw new GeneralError('Server Error', `${err}`);
      comments.forEach((comment) => {
        postComments.push(comment);
      });
      res.status(200).send(postComments);
    });
  } catch (err) {
    next(err);
  }
});

/** update a comment */
router.put('/update', jsonParser, async (req, res, next) => {
  const {
    user_id: userId,
    author: authorId,
    comment: commentId,
    body: newCommentBody,
  } = req.body;

  try {
    if (!checkExist(commentId)) throw new BadRequest('Missing required field: comment');
    if (!checkExist(newCommentBody)) throw new BadRequest('Missing required field: body');
    Comment.findOneAndUpdate(
      { _id: commentId },
      { body: newCommentBody },
      { new: true },
      (err, comment) => {
        if (err) throw new GeneralError('Server Error', `${err}`);
        res.status(200).send(comment);
      },
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;
