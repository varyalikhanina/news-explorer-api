const User = require('../models/user');

const Unathorized = require('../errors/unathorized');
const BadRequest = require('../errors/bad-request');
const UserExists = require('../errors/user-exists');

const login = (req, res, next) => {
  const { email, password } = req.body;
  const { NODE_ENV, JWT_SECRET } = process.env;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      res.send({
        token: jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'secret', { expiresIn: '7d' }),
      });
    })
    .catch(() => {
      next(new Unathorized('Неверная почта или пароль'));
    });
};

const createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      email,
      password: hash,
    }))
    .then((user) => res.status(201).send({
      _id: user._id,
      name: user.name,
      email: user.email,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Введите имя, почту и пароль'));
      } else {
        next(new UserExists('Такой пользователь уже существует'));
      }
    });
};

const getUser = (req, res, next) => {
  User.findById({})
    .then((user) => res.send({ data: user }))
    .catch(next);
};

module.exports = {
  login,
  createUser,
  getUser
};