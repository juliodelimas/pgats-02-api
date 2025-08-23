const bcrypt = require('bcryptjs');


// In-memory user database
const users = [
  {
    username: 'henrique',
    password: bcrypt.hashSync('123456', 10),
    favorecidos: ['bruna'],
    saldo: 10000
  },
  {
    username: 'bruna',
    password: bcrypt.hashSync('123456', 10),
    favorecidos: ['henrique'],
    saldo: 10000
  }
];

module.exports = {
  users
};
