const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const mongoose = require('mongoose');
const { json } = require('body-parser');
const { errors } = require('celebrate');
const NotFoundError = require('./errors/not-found');
const router = require('./routes/index');
const limiter = require('./middlewares/rateLimiter');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { MONGO_DB, PORT } = require('./utils/config');
const { MESSAGES } = require('./utils/messages');

const app = express();

mongoose.connect(MONGO_DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(cors({ credentials: true, origin: true }));
app.use(helmet());
app.use(json());
app.use(limiter);
app.use(requestLogger);
app.use(router);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error(MESSAGES.serverIsAboutToFail);
  }, 0);
});

app.use(errorLogger);
app.use(errors());

app.use((req, res, next) => {
  next(new NotFoundError(MESSAGES.sourceNotFound));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({
    message: statusCode === 500 ? MESSAGES.serverError : message,
  });
  next();
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
