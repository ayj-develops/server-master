const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const bodyParser = require('body-parser');

const API_ROUTE = '/api/v0';

const app = express();

const corsOptions = require('./config/cors.config');
const connectMongo = require('./config/mongo.config');

app.use(cors(corsOptions));
app.use(helmet());
app.use(compression());
app.use(bodyParser());
app.disable('x-powered-by');

connectMongo();

// listening to the port
const PORT = 8000;
// eslint-disable-next-line no-console
app.listen(PORT, () => console.log(`listening on port ${PORT}`)); // dev

// index
app.get('/', (req, res) => {
  res.sendStatus(200);
});
