const mongoose = require('mongoose');

const { Schema } = mongoose;

const ClubSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    unique: true,
  },
  description: {
    type: String,
    required: true,
    unique: false,
    minlength: 1,
    maxlength: 100,
  },
  execs: [{ exec_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }],
  teacher: [{ teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }],
  clubfest_link: {
    type: String,
    required: false,
  },
  socials: {
    instagram: String,
    google_classroom_code: { type: String, maxlength: 8 },
    signup_link: String,
  },
  events: Number,
  posts: Number,
});

const Club = mongoose.model('Club', ClubSchema);

module.exports = Club;
