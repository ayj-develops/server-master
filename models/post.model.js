const mongoose = require('mongoose');

const User = require('./user.model');
const Club = require('./club.model');
const { ObjectId } = require('mongodb');

const { Schema } = mongoose;

const PostSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: false,
        minlength: 3,
        maxlength: 30
    },
    body: {
        type: String,
        required: false,
        unique: false,
        minlength: 1,
        maxlength: 500
    },
    author: {
        type: mongoose.Types.ObjectId,
        unique: false,
        required: true,
        ref: "User"
    },
    club: {
        type: mongoose.Types.ObjectId,
        unique: false,
        required: true,
        ref: 'Club'
    },
    likes: {
        type: Number,
        unique: false,
        required: true,
        default: 0
    },
    flairs: {
        type: [String],
        important: {type: Boolean, defualt: false},
        unique: false,
        required: false,
    },
    attachment: {
        type: Object,
        required: false,
        unique: false
    },
    createdAt: {
        type: Date,
        required: true,
        unique: false,
        default: Date.now
    }
});

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;