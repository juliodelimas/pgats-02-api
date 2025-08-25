// package.json add script
//  "test-external": "mocha \"test/external/**/*.test.js\" --timeout 10000",
//  "test-controller": "mocha \"test/controller/**/*.test.js\" --timeout 10000",

// Bibliotecas
const request = require('supertest');
const { expect } = require('chai');

// Testes
/*
describe('Transfer External', () => {
    describe('POST /transfers', () => {
        it.only('Quando informo remetente e destinatario inexistentes recebo 400', async () => {
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
*/

// Teste ajustado para JWT 
describe('Transfer External', () => {
    describe('POST /transfers', () => {
        it('Quando informo remetente e destinatario inexistentes recebo 400', async () => {
            // 1º Passo, capturar token
            const respostaLogin = await request('http://localhost:3000')
                .post('/users/login')
                .send({
                    username: 'julio',
                    password: '123456'
                });
            
            // Para entender o processo utilizarei constante
            const tokens = respostaLogin.body.token;

            // 2ª Passo, já existia 
            const resposta = await request('http://localhost:3000')
                .post('/transfers')
                .set('Authorization', `Bearer ${tokens}`) // 'Bearer' + tokens
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