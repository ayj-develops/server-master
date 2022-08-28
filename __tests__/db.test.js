const app = require('../app');
const supertest = require('supertest');
const request = supertest(app);


const newTeacher = {
  email: 'teacher@tdsb.on.ca'
}

const newStudent = {
  email: 'student@student.tdsb.on.ca'
}
