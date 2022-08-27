const mongoose = require('mongoose');

const { Schema } = mongoose;

// https://www.mongodb.com/docs/manual/tutorial/model-tree-structures-with-parent-references/

const CommentSchema = new Schema({
  postParent: {
    type: mongoose.Types.ObjectId,
    ref: 'Post',
  },
  parent: {
    type: mongoose.Types.ObjectId,
    ref: 'Comment',
  },
  author: {
    type: mongoose.Types.ObjectId,
    required: true,
    unique: false,
    ref: 'User',
  },
  body: {
    type: String,
  },
  createdAt: {
    type: Date,
    required: true,
    unique: false,
    default: Date.now,
    expires: 4 * 365 * 24 * 60,
  },
  deletedMessage: {
    type: String,
    required: false,
  },
  likes: {
    type: Number,
  },
});

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;
