const mongoose = require('mongoose');

const { Schema } = mongoose;

const ClubSchema = new Schema({
  // name: {
  //     type: String,
  //     required: true,
  //     unique: true,
  //     default: "Unnamed",
  //     minlength: 5,
  //     maxlength: 30
  // },
  name: String,
  // slug: {
  //     type: String,
  //     unique: true,
  //     required: true
  // },
  slug: String,
  bannerImage: {
    type: String,
  },
  // description: {
  //     type: String,
  //     unique: false,
  //     required: false,
  //     minlength: 3,
  //     maxlength: 500
  // },
  description: String,
  // execs: [{
  //     type: mongoose.Types.ObjectId,
  //     required: true,
  //     unique: false
  // }],
  execs: [String],
  // socials: {
  //     instagram: {type: String, unique: true, required: false},
  //     google_classroom_code: {type: String, unique: true, required: false},
  //     signup_link: {type: String, required: false, unique: true}
  // },
  socials: { instagram: String, google_classroom_code: String, signup_link: String },
  // posts: {
  //     posts: [{
  //         type: mongoose.Types.ObjectId,
  //         required: false,
  //         unique: false,
  //         minlength: 1,
  //         ref: 'Post'
  //     }],
  //     quantity: Number,
  //     required: false,
  //     unique: false
  // },
  posts: [mongoose.Types.ObjectId],
  // members: [{
  //     type: mongoose.Types.ObjectId,
  //     required: true,
  //     unique: false,
  //     minlength: 1,
  //     ref: 'User'
  // }],
  members: [String],
  // execs: [{
  //     type: mongoose.Types.ObjectId,
  //     required: false,
  //     unique: false,
  //     ref: 'User'
  // }],
  teacher: String,
  flairs: [String],
});

const Club = mongoose.model('Club', ClubSchema);

module.exports = Club;
