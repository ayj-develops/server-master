const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    body: {
        type: String,
        required: true,
        unique: false,
        minlength: 1,
        maxlength: 500
    },
    parent: {
        type: String,
        required: true,
        unique: false
    }
})

const Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;