const { users } = require('../model/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'seu-jwt-secret-muito-seguro';

function findUserByUsername(username) {
  return users.find(u => u.username === username);
}

function registerUser({ username, password, favorecidos = [] }) {
  if (findUserByUsername(username)) {
    throw new Error('Usuário já existe');
  }
  const hashedPassword = bcrypt.hashSync(password, 8);
  const user = { username, password: hashedPassword, favorecidos, saldo: 10000 };
  users.push(user);
  return { username, favorecidos, saldo: user.saldo };
}

function loginUser({ username, password }) {
  const user = findUserByUsername(username);
  if (!user) throw new Error('Usuário não encontrado');
  if (!bcrypt.compareSync(password, user.password)) throw new Error('Senha inválida');
  
  // Gerar JWT Token
  const token = jwt.sign(
    { username: user.username },
    JWT_SECRET,
    { expiresIn: '10m' }
  );
  
  return { 
    username: user.username, 
    favorecidos: user.favorecidos, 
    saldo: user.saldo,
    token 
  };
}

function listUsers() {
  return users.map(u => ({ username: u.username, favorecidos: u.favorecidos, saldo: u.saldo }));
}

function validateToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new Error('Token inválido');
  }
}

module.exports = { registerUser, loginUser, listUsers, findUserByUsername, validateToken };
