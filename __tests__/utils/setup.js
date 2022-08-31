const User = require('../../models/user.model');

const userOne = {
  email: "userOne@student.tdsb.on.ca"

}

const userTwo = {
  email: "userTwo@student.tdsb.on.ca"

}

const userThree = {
  email: "userThree@student.tdsb.on.ca"

}

const teacherOne = {
  email: "teacherOne@tdsb.on.ca",
  account_type: "teacher"

}

const teacherTwo = {
  email: "teacherTwo@tdsb.on.ca",
  account_type: "teacher"
}

const setUpUsers = async () => {
  await User.deleteMany({});
  await User.create(userOne);
  await User.create(userTwo);
  await User.create(userThree);
  await User.create(teacherOne);
  await User.create(teacherTwo);
}

module.exports = {
  userOne,
  userTwo,
  userThree,
  teacherOne,
  teacherTwo,
  setUpUsers,
}

