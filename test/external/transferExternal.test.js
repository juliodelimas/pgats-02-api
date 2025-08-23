// Bibliotecas
const request = require('supertest');
const { expect } = require('chai');

// Testes
describe('Transfer', () => {
    describe('POST /transfers', () => {
        it.only('Quando informo remetente e destinatario inexistentes recebo 400', async () => {
            //capturar o token
            const respostaLogin = await request('http://localhost:3000')
            .post('/users/login')
            .send({
                username: 'henrique',
                password: '123456'
            });
            const token = respostaLogin.body.token


            const resposta = await request('http://localhost:3000')
                .post('/transfers')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    from: "henrique",
                    to: "xpto",
                    value: 100
                });
            
            expect(resposta.status).to.equal(400);
            expect(resposta.body).to.have.property('error', 'Usuário remetente ou destinatário não encontrado')
        });


        it.only('Quando informo remetente e destinatario existente e autenticado recebo 201', async () => {
            //capturar o token
            const respostaLogin = await request('http://localhost:3000')
            .post('/users/login')
            .send({
                username: 'henrique',
                password: '123456'
            });
            const token = respostaLogin.body.token


            const resposta = await request('http://localhost:3000')
                .post('/transfers')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    from: "henrique",
                    to: "bruna",
                    value: 100
                });
            
            expect(resposta.status).to.equal(201);
        });
    });
});