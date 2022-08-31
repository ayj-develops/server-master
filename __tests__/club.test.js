const supertest = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { default: mongoose } = require('mongoose');
const app = require('../app');
const { setUpUsers } = require('./utils/setup');
const User = require('../models/user.model');

const request = supertest(app);

const authToken = process.env.AUTH_TOKEN;

describe('Club Endpoint Tests', () => {
  beforeAll(async () => {
    const tempMongoDB = await MongoMemoryServer.create();
    await mongoose.connect(`${tempMongoDB.getUri()}`, { useNewUrlParser: true, useUnifiedTopology: true });
    await setUpUsers();
    console.log('setUpUsers() completed');
  });

  it('POST /clubs/create should create a new club WITHOUT: execs, flairs, posts, members', async () => {
    const user = await User.findOne({ email: 'userOne@student.tdsb.on.ca' });

    const teacher = await User.findOne({ email: 'teacherOne@tdsb.on.ca' });

    const newClub = {
      name: 'Club One',
      description: 'This is a new club called Club One',
      teacher: teacher._id,
      instagram: 'https://www.instagram.com/github',
      google_classroom_code: 'https://classroom.google.com/c/123456789',
      signup_link: 'https://forms.gle/ZYXWVUTSRQPQWERTY',
    };

    const response = await request
      .post('/api/v0/clubs/create')
      .set('Authorization', `Bearer ${user.token}`)
      .send(newClub);
    expect(response.status).toBe(200);
    expect(response.body.club.name).toBe('Club One');
    expect(response.body.club.description).toBe('This is a new club called Club One');
    expect(response.body.club.teacher.toString()).toBe(teacher._id.toString());
    expect(response.body.club.socials.instagram).toBe('https://www.instagram.com/github');
    expect(response.body.club.socials.google_classroom_code).toBe('https://classroom.google.com/c/123456789');
    expect(response.body.club.socials.signup_link).toBe('https://forms.gle/ZYXWVUTSRQPQWERTY');
  }, 20000);

  it('PUT /clubs/:id/executives/new should add a new executive to the club', async () => {
    // create the club
    const user = await User.findOne({ email: 'userOne@student.tdsb.on.ca' });

    const teacher = await User.findOne({ email: 'teacherOne@tdsb.on.ca' });

    const newClub = {
      name: 'Club One',
      description: 'This is a new club called Club One',
      teacher: teacher._id,
      instagram: 'https://www.instagram.com/github',
      google_classroom_code: 'https://classroom.google.com/c/123456789',
      signup_link: 'https://forms.gle/ZYXWVUTSRQPQWERTY',
    };

    const response = await request.post('/api/v0/clubs/create').send(newClub);

    expect(response.status).toBe(200);
    expect(response.body.club.name).toBe('Club One');
    expect(response.body.club.description).toBe('This is a new club called Club One');
    expect(response.body.club.teacher.toString()).toBe(teacher._id.toString());
    expect(response.body.club.socials.instagram).toBe('https://www.instagram.com/github');
    expect(response.body.club.socials.google_classroom_code).toBe('https://classroom.google.com/c/123456789');
    expect(response.body.club.socials.signup_link).toBe('https://forms.gle/ZYXWVUTSRQPQWERTY');

    // add the executive
    const clubExecutive = await User.findOne({ email: 'userThree@student.tdsb.on.ca' });
    const executiveResponse = await request.put(`/api/v0/clubs/${response.body.club._id}/executives/new`).send({ id: clubExecutive._id });
    expect(executiveResponse.status).toBe(200);
    expect(executiveResponse.body.updatedClub.execs.toString()).toBe(clubExecutive._id.toString());

  }, 20000);

  it('GET /clubs/:id should get the club', async () => {
    const user = await User.findOne({ email: 'userOne@student.tdsb.on.ca' });
    const teacher = await User.findOne({ email: 'teacherOne@tdsb.on.ca' });

    const newClub = {
      name: 'Club One',
      description: 'This is a new club called Club One',
      teacher: teacher._id,
      instagram: 'https://www.instagram.com/github',
      google_classroom_code: 'https://classroom.google.com/c/123456789',
      signup_link: 'https://forms.gle/ZYXWVUTSRQPQWERTY',
    };

    const response = await request.post('/api/v0/clubs/create').send(newClub);

    expect(response.status).toBe(200);
    expect(response.body.club.name).toBe('Club One');
    expect(response.body.club.description).toBe('This is a new club called Club One');
    expect(response.body.club.teacher.toString()).toBe(teacher._id.toString());
    expect(response.body.club.socials.instagram).toBe('https://www.instagram.com/github');
    expect(response.body.club.socials.google_classroom_code).toBe('https://classroom.google.com/c/123456789');
    expect(response.body.club.socials.signup_link).toBe('https://forms.gle/ZYXWVUTSRQPQWERTY');

    const clubResponse = await request.get(`/api/v0/clubs/${response.body.club._id}`);
    expect(clubResponse.status).toBe(200);
    expect(clubResponse.body.name).toBe('Club One');
    expect(clubResponse.body.description).toBe('This is a new club called Club One');
    expect(clubResponse.body.teacher.toString()).toBe(teacher._id.toString());
    expect(clubResponse.body.socials.instagram).toBe('https://www.instagram.com/github');
    expect(clubResponse.body.socials.google_classroom_code).toBe('https://classroom.google.com/c/123456789');
    expect(clubResponse.body.socials.signup_link).toBe('https://forms.gle/ZYXWVUTSRQPQWERTY');
  }, 20000);


  afterAll(async () => {
    await mongoose.disconnect();
  });
});
