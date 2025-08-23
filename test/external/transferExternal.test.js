// package.json add script
//  "test-external": "mocha \"test/external/**/*.test.js\" --timeout 10000",
//  "test-controller": "mocha \"test/controller/**/*.test.js\" --timeout 10000",

// Bibliotecas
const request = require('supertest');
const { expect } = require('chai');

// Testes
describe('Transfer External', () => {
    describe('POST /transfers', () => {
        it('Quando informo remetente e destinatario inexistentes recebo 400', async () => {
            const resposta = await request('http://localhost:3000')
                .post('/transfers')
                .send({
                    from: "julio",
                    to: "priscila",
                    value: 100
                });
            
            expect(resposta.status).to.equal(400);
            expect(resposta.body).to.have.property('error', 'Usuário remetente ou destinatário não encontrado');
        });
    });
});