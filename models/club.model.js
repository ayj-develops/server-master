const mongoose = require('mongoose');

const { Schema } = mongoose;

const ClubSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        default: "Unnamed",
        minlength: 5,
        maxlength: 30
    },
    slug: {
        type: String,
        unique: true,
        required: true
    },
    description: {
        type: String,
        unique: false,
        required: false,
        minlength: 3,
        maxlength: 500
    },
    execs: [{
        type: mongoose.Types.ObjectId,
        required: true,
        unique: false
    }],
    socials: {
        instagram: {type: String, unique: true, required: false},
        google_classroom_code: {type: String, unique: true, required: false},
        signup_link: {type: String, required: false, unique: true}
    },
    posts: [{
        type: mongoose.Types.ObjectId,
        required: false,
        unique: false,
        minlength: 1,
        ref: 'Post'
    }],
    members: [{
        type: mongoose.Types.ObjectId,
        required: true,
        unique: false,
        minlength: 1,
        ref: 'User'
    }],
    execs: [{
        type: mongoose.Types.ObjectId,
        required: false,
        unique: false,
        ref: 'User'
    }],
    teacher: {
        type: mongoose.Types.ObjectId,
        unique: false,
        required: true
    }
});

const Club = mongoose.model('Club', ClubSchema);

module.exports = Club;