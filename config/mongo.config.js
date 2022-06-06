/* eslint-disable no-console */
const mongoose = require('mongoose');
require('dotenv').config();

const password = process.env.DB_PASSWORD;
const host = process.env.DB_HOST;
const url = process.env.DB_URL;

// set up mongo db
const connectMongo = () => {
  mongoose.connect(
    `mongodb+srv://${host}:${password}${url}`,
    { useNewUrlParser: true, useUnifiedTopology: true },
  )
    .then(() => {
      console.log('connected');
    }).catch((error) => {
      console.log('error connecting to db: ', error.message);
    });
};

module.exports = connectMongo;
