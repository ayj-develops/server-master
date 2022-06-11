const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  // username: {
  //   type: String,
  //   required: false,
  //   unique: false,
  //   minlength: 3,
  //   maxlength: 32,
  // },
  email: {
    type: String,
    trim: true,
    unique: true,
  },
  pfp: {
    type: Object,
    required: false,
  }
    // id: {
    //     type: String
    // },
    // posts: {
    //     type: Array()
    // },
    // perms: {
    //     type: Perm
    // }
})

const User = mongoose.model("User", UserSchema);

module.exports = User;