const request = require('supertest');
const { expect, use } = require('chai');

const loginUser = require('../fixture/requisicoes/login/loginUser.json');

const chaiExclude = require('chai-exclude');
use(chaiExclude);
require('dotenv').config();

describe('Testes de Transferência', () => {
  let token;

  before(async () => {
    const respostaLogin = await request(process.env.BASE_URL_GRAPHQL)
      .post('')
      .send(loginUser);

    token = respostaLogin.body.data.loginUser.token;
  });

  it('Validar que é possível transferir grana entre duas contas', async () => {
    const respostaEsperada = require ('../fixture/respostas/transferencia/validarQueEPossivelTransferirGranaEntreDuasContas.json')

    const createTransfer = require('../fixture/requisicoes/transferencia/createTransfer.json');

    const respostaTransferencia = await request(process.env.BASE_URL_GRAPHQL)
      .post('')
      .set('Authorization', `Bearer ${token}`)
      .send(createTransfer);

    expect(respostaTransferencia.status).to.equal(200);
    expect(respostaTransferencia.body.data.createTransfer)
      .excluding('date')
      .to.deep.equal(respostaEsperada.data.createTransfer);

  });

  it('Validar que não é possível transferir de uma conta que não possui saldo suficiente', async () => {
    const createTransfer = require('../fixture/requisicoes/transferencia/createTransfer.json');
    createTransfer.variables.value = 10000.01;

    const respostaTransferencia = await request(process.env.BASE_URL_GRAPHQL)
      .post('')
      .set('Authorization', `Bearer ${token}`)
      .send(createTransfer);

    expect(respostaTransferencia.body).to.have.property('errors');
    expect(respostaTransferencia.body.errors[0].message).to.equal('Saldo insuficiente');
  });
});
