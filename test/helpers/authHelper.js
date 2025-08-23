const request = require('supertest');
const app = require('../../app');

/**
 * Faz login real e obtém token JWT
 * @param {string} username - Nome do usuário 
 * @param {string} password - Senha do usuário
 * @returns {Promise<string>} JWT Token
 */
async function loginAndGetToken(username, password) {
  const response = await request(app)
    .post('/users/login')
    .send({ username, password });

  if (response.status !== 200) {
    throw new Error(`Login falhou: ${response.body.error}`);
  }

  return response.body.token;
}

/**
 * Gera headers de autorização fazendo login real
 * @param {string} username - Nome do usuário (henrique ou bruna)
 * @param {string} password - Senha do usuário (default: 123456)
 * @returns {Promise<Object>} Headers com Authorization
 */
async function getAuthHeaders(username = 'henrique', password = '123456') {
  const token = await loginAndGetToken(username, password);
  return {
    'Authorization': `Bearer ${token}`
  };
}

module.exports = {
  loginAndGetToken,
  getAuthHeaders
};
