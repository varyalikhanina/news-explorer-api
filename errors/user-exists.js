const { Error } = require('mongoose');

class UserExists extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 409;
  }
}

module.exports = UserExists;
