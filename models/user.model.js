const mongoose = require('mongoose');
const Club = require('./club.model');
const Post = require('./post.model');
const Comment = require('./comment.model')

const { Schema } = mongoose;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    pfp: {
        type: Object,
        unique: false,
        required: false
    },
    clubs: [{
        type: mongoose.Types.ObjectId,
        unique: false,
        required: false,
        ref: 'Club'
    }],
    favorite_clubs: [{
        type: mongoose.Types.ObjectId,
        unique: false,
        required: false,
        ref: 'Club'
    }],
    posts: [{
        type: mongoose.Types.ObjectId,
        unique: false,
        required: false,
        ref: 'Post'
    }],
    fav_posts: [{
        type: mongoose.Types.ObjectId,
        unique: false,
        required: false,
        ref: 'Post'
    }],
    comments: [{
        type: mongoose.Types.ObjectId,
        unique: false,
        required: false,
        ref: 'Comment'
    }],
    fav_comments: [{
        type: mongoose.Types.ObjectId,
        unique: false,
        required: false,
        ref: 'Comment'
    }],
    account_type: {
        type: String,
        unique: false,
        required: true,
        default: 'student',
        immutable: true
    },
    createdAt: {
        type: Date,
        required: false,
        unique: false,
        default: Date.now,
        expires: 4*365*24*60
    },
    liked: [{
        type: mongoose.Types.ObjectId,
        required: false,
        unique: false
    }]

})

const User = mongoose.model('User', UserSchema);

module.exports = User;