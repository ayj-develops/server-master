const app = require('./app');

// listening to the port
const PORT = 8000;
// eslint-disable-next-line no-console
app.listen(PORT, () => console.log(`listening on port ${PORT}`)); // dev
