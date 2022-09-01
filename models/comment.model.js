const mongoose = require('mongoose');

const Post = require('./post.model');
const User = require('./user.model');

const { Schema } = mongoose;

const CommentSchema = new Schema({
  parent: {
    type: mongoose.Types.ObjectId,
    required: true,
    unique: false,
  },
  author: {
    type: String,
    required: true,
    unique: false,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    required: true,
    unique: false,
    default: Date.now,
    expires: 4 * 365 * 24 * 60,
  },
  children: [{
    type: mongoose.Types.ObjectId,
    required: false,
    unique: false,
  }],
});

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;
