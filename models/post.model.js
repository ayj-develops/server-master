const mongoose = require('mongoose');

const { Schema } = mongoose;

// TODO: Temporarily use barebones schema to recieve json
// data until we figure out how to handle mongodb schema validations

const PostSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: false,
    minlength: 3,
    maxlength: 30,
  },
  body: {
    type: String,
    required: false,
    unique: false,
    minlength: 1,
    maxlength: 500,
  },
  author: {
    type: mongoose.Types.ObjectId,
    unique: false,
    required: true,
    ref: 'User',
  },
  club: {
    type: mongoose.Types.ObjectId,
    unique: false,
    required: true,
    ref: 'Club',
  },
  likes: {
    type: Number,
    unique: false,
    required: true,
    default: 0,
  },
  flairs: [String],
  attachment: {
    type: Object,
    required: false,
    unique: false,
  },
  createdAt: {
    type: Date,
    required: true,
    unique: false,
    default: Date.now,
  },
  children: [{
    type: mongoose.Types.ObjectId,
    required: false,
    unique: false,
  }],
  comments: [{
    type: mongoose.Types.ObjectId,
    required: false,
    unique: false,
    ref: 'Comment',
  }],
});

// const PostSchema = new Schema({
//   title: {
//     type: String,
//     required: true,
//     minlength: 3,
//     maxlength: 30,
//   },
//   slug: {
//     type: String,
//     required: true,
//   },
//   body: {
//     type: String,
//     required: false,
//     unique: false,
//     minlength: 1,
//     maxlength: 500,
//   },
//   author: {
//     type: String,
//     required: true,
//   },
//   image: {
//     type: Object,
//     required: false,
//   },
//   club: {
//     type: String,
//     required: true,
//   },
// });

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;
