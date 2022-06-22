const mongoose = require('mongoose');

const { Schema } = mongoose;

// TODO: Temporarily use barebones schema to recieve json
// data until we figure out how to handle mongodb schema validations

const PostSchema = new Schema({
  title: String,
  slug: String,
  body: String,
  author: String,
  image: Object,
  club: String,
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
