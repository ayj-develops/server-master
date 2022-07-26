const User = require('../models/user.model');
const Club = require('../models/club.model');
const Comment = require('../models/comment.model');
const Post = require('../models/post.model');

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {checkExist} = require('./exist');

const getUser = async (field, param) => {
    return User.findOne({[field] : param}, async (err, user) => {
        if (err) return {code: 500, Message: err};
        else if (!checkExist(user)) return {code: 404, Message: "User not found"}
        else return {user};
    }).clone();
}

const getClub = async (field, param) => {
    return Club.findOne({[field] : param}, async (err, club) => {
        if (err) return {code: 500, Message: err};
        else if (!checkExist(club)) return {code: 404, Message : "Club not found"};
        else return club;
    }).clone();
}

const getComment = async (field, param) => {
    return Comment.findOne({ [field] : param }, async (err, comment) => {
        if (err) return {code: 500, Message: err};
        else if (!checkExist(comment)) return {code: 404, Message: "Comment not found"};
        else return comment;
    }).clone();
}

const getPost = async (field, param) => {
    return Post.findOne({[field] : param}, async (err, post) => {
        if (err) return {code: 500, Message: err};
        else if (!checkExist(post)) return {code: 404, Message: "User not found"}
        else return {post};
    }).clone();
}

exports.getUser = getUser;
exports.getClub = getClub;
exports.getComment = getComment;
exports.getPost = getPost;