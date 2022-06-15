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
  execs: {
    type: Array,
    required: true,
    unique: false,
    minlength: 1,
  },
  teacher: {
    type: Array,
    required: true,
    unique: false,
    minlength: 1,
  },
});

const Club = mongoose.model('Club', ClubSchema);

module.exports = Club;
