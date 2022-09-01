# Writing tests

> **Guidelines:**
> - Do not use `if` statements for tests, instead if the need arises, split the test into two different tests
> - Write the test in 'arrange', 'act', and 'assert'

**NOTE:** Before all tests, comment out `connectMongo()` in app.js

## Write a test suite first:

```js
describe('What object this test suite interacts with', () => {
  beforeAll(async () => {
    const tempMongoDB = await MongoMemoryServer.create();
    await mongoose.connect(`${tempMongoDB.getUri()}`, { useNewUrlParser: true, useUnifiedTopology: true });
    await setUpUsers();
    console.log('setUpUsers() completed');
  });

  // tests here
  ...

  afterAll(async () => {
    await mongoose.disconnect();
  });
});

```

**One** test suite per file

## Write the test

Each test should be written in between the `beforeAll()` and `afterAll()` functions in the test suite.

```js
it('GET /clubs/:id should get the club', async () => {
   
   // arrange (set everything up)
   const teacher = await User.findOne({ email: 'teacherOne@tdsb.on.ca' });
   const newClub = {
      name: 'Club One',
      description: 'This is a new club called Club One',
      teacher: teacher._id,
      instagram: 'https://www.instagram.com/github',
      google_classroom_code: 'https://classroom.google.com/c/123456789',
      signup_link: 'https://forms.gle/ZYXWVUTSRQPQWERTY',
   };
   ...

   // act (test the request)
   const response = await request
      .post('/api/v0/clubs/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newClub);
   ...

   // assert (assert the request works as expected)
   expect(response.status).toBe(200);
   ...

}, 20000); // timeout amount (20 sec)
```

Additionally, each test should focus on **one** endpoint.

## Full sample

```js
describe('What object this test suite interacts with', () => {
    beforeAll(async () => {
        const tempMongoDB = await MongoMemoryServer.create();
        await mongoose.connect(`${tempMongoDB.getUri()}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        await setUpUsers();
        console.log('setUpUsers() completed');
    });

    it('GET /clubs/:id should get the club', async () => {

        const teacher = await User.findOne({
            email: 'teacherOne@tdsb.on.ca'
        });
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
            .set('Authorization', `Bearer ${authToken}`)
            .send(newClub);

        expect(response.status).toBe(200);
        expect(response.club.name).toBe('Club One');

    }, 20000);

    afterAll(async () => {
        await mongoose.disconnect();
    });
});
```