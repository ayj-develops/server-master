const User = require('../models/user.model');
const Club = require('../models/club.model');
const Comment = require('../models/comment.model');
const Post = require('../models/post.model');

const { checkExist } = require('./exist');

const getUser = async (field, param) => User.findOne({ [field]: param }, async (err, user) => {
  if (err) return { code: 500, message: err };
  if (!checkExist(user)) return { code: 404, message: 'User not found' };
  return { user };
}).clone();

const getClub = async (field, param) => Club.findOne({ [field]: param }, async (err, club) => {
  if (err) return { code: 500, message: err };
  if (!checkExist(club)) return { code: 404, message: 'Club not found' };
  return club;
}).clone();

const getComment = async (field, param) => Comment.findOne(
  { [field]: param },
  async (err, comment) => {
    if (err) return { code: 500, message: err };
    if (!checkExist(comment)) return { code: 404, message: 'Comment not found' };
    return comment;
  },
).clone();

const getPost = async (field, param) => Post.findOne({ [field]: param }, async (err, post) => {
  if (err) return { code: 500, message: err };
  if (!checkExist(post)) return { code: 404, message: 'User not found' };
  return { post };
}).clone();

exports.getUser = getUser;
exports.getClub = getClub;
exports.getComment = getComment;
exports.getPost = getPost;
