const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const { MESSAGES } = require('../utils/messages');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
  },
  email: {
    unique: true,
    type: String,
    required: true,
    validate: {
      validator(email) {
        return validator.isEmail(email);
      },
      message: MESSAGES.emailRequired,
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

userSchema.statics.findUserByCredentials = function findUserByCredentials(email, password, next) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error(MESSAGES.userNotFound));
      } return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new Error(MESSAGES.authorizationFailed));
          } return user;
        });
    })
    .catch(next);
};

module.exports = mongoose.model('user', userSchema);
