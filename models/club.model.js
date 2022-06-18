const mongoose = require('mongoose');

const { Schema } = mongoose;

const ClubSchema = new Schema({
  name: String,
  slug: String,
  description: String,
  execs: [String],
  teachers: [String],
  clubfest_link: {
    type: String,
    required: false,
  },
  socials: {
    instagram: String,
    google_classroom_code: String,
    signup_link: String,
  },
  events: Number,
  posts: Number,
});

const Club = mongoose.model('Club', ClubSchema);

module.exports = Club;
