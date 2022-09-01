const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

const API_ROUTE = '/api/v0';

const app = express();

const corsOptions = require('./config/cors.config');
const connectMongo = require('./config/mongo.config');

app.use(cors(corsOptions));
app.use(helmet());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.disable('x-powered-by');

require('dotenv').config();

/*
 * Initialize firebase app
 */
const pathToService = process.env.GOOGLE_APPLICATION_CREDENTIALS;
// eslint-disable-next-line import/no-dynamic-require
const serviceAccount = require(pathToService);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Connect to mongodb
// connectMongo(); // comment out when testing, tests run using an in memory mongodb database

// index
app.get('/', (req, res) => {
  res.sendStatus(200);
});

// setup firebase middlware
const decodeIdToken = require('./middleware/firebaseAuthHandler');

app.use(decodeIdToken);

// error handler middleware
const handleErrors = require('./middleware/errorHandler');

app.use(handleErrors);

/* define api routes */
const userRouter = require('./api/user');

app.use(`${API_ROUTE}/user`, userRouter);

const commentRouter = require('./api/comment');

app.use(`${API_ROUTE}/comment`, commentRouter);

const clubRouter = require('./api/club');

app.use(`${API_ROUTE}/clubs`, clubRouter);

const postRouter = require('./api/post');

app.use(`${API_ROUTE}/post`, postRouter);

app.use(`${API_ROUTE}/admin`, require('./api/admin'));

module.exports = app;
