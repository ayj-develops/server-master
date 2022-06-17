const mongoose = require('mongoose');

const { Schema } = mongoose;

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
    type: String,
    unique: false,
    required: true,
  },
  image: {
    type: Object,
    required: false,
    unique: false,
  },
  club: {
    type: String,
    required: true,
    unique: false,
  },
});

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;
