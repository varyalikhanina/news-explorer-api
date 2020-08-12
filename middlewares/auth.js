const jwt = require('jsonwebtoken');
const { MESSAGES } = require('../utils/messages');
const Unathorized = require('../errors/unathorized');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  const { NODE_ENV, JWT_SECRET } = process.env;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    next(new Unathorized(MESSAGES.auhorizationRequired));
  }
  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'secret');
  } catch (err) {
    next(new Unathorized(MESSAGES.auhorizationRequired));
  }
  req.user = payload;
  next();
};
