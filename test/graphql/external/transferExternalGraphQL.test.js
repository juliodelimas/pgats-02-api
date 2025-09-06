// Bibliotecas
const request = require('supertest');
const { expect, use } = require('chai');

const chaiExclude = require('chai-exclude');
use(chaiExclude)

require('dotenv').config();

// Testes
describe('Testes de Transferência', () => {

    before(async () => {
         const loginUser = require('../fixture/requisicoes/login/loginUser.json');
         const resposta = await request(process.env.BASE_URL_GRAPHQL)
            .post('')
            .send(loginUser);
           token = resposta.body.data.loginUser.token;
        });

    beforeEach(() => {
        createTransfer = require('../fixture/requisicoes/transferencia/createTransfer.json');
    });   



    it('Validar que é possível transferir grana entre duas contas', async () => {
        //Escrever o teste
            const respostaEsperada = require('../fixture/respostas/transferencia/validarQueEPossivelTransferirGranaEntreDuasContas.json');

            const respostaTransferencia = await request(process.env.BASE_URL_GRAPHQL)
            .post('')
            .set('Authorization', `Bearer ${token}`)
            .send(createTransfer);
            expect(respostaTransferencia.status).to.equal(200);
            expect(respostaTransferencia.body.data.createTransfer)
                   .excluding('date')
                   .to.deep.equal(respostaEsperada.data.createTransfer);
        })

        it('Validar que não é possível transferir quando o saldo é insuficiente', async () => {
        //Escrever o teste  
         createTransfer.variables.value = 10000.01
         const respostaSaldoInsuficiente = await request(process.env.BASE_URL_GRAPHQL)
         
            .post('')
            .set('Authorization', `Bearer ${token}`)
            .send(createTransfer);
            expect(respostaSaldoInsuficiente.status).to.equal(200);
            expect(respostaSaldoInsuficiente.body.errors[0].message).to.equal('Saldo insuficiente');
        })
    });