// Bibliotecas
const request = require('supertest');
const sinon = require('sinon');
const { expect } = require('chai');


// Aplicação
const app = require('../../../app');

// Mock
const transferService = require('../../../service/transferService');

// Testes
describe('Transfer Controller', () => {
    describe('POST /transfers', () => {
        it('Quando informo remetente e destinatário inexistente recebo 400', async () => {
           const resposta = await request(app)
            .post('/transfers')
            .send({ 
                from: "fraissat", 
                to: "nathi", 
                value: 100
            });
           expect (resposta.status).to.equal(400);
           expect(resposta.body).to.have.property('error', 'Usuário remetente ou destinatário não encontrado');
        })
    });    



    describe('GET /transfers', () => {
        // Its ficam aqui
    });
});