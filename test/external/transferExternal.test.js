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
    before(async () => {
        // 1º Passo, capturar token
        const respostaLogin = await request('http://localhost:3000')
            .post('/users/login')
            .send({
                username: 'julio',
                password: '123456'
            });
        
        // Para entender o processo utilizarei constante
        this.tokens = respostaLogin.body.token;
    });
    describe('POST /transfers', () => {
        it('Quando informo remetente e destinatario inexistentes recebo 400', async () => {

            // 2ª Passo, já existia 
            const resposta = await request('http://localhost:3000')
                .post('/transfers')
                .set('Authorization', `Bearer ${this.tokens}`) // 'Bearer' + tokens
                .send({
                    from: "julio",
                    to: "izabella",
                    value: 100
                });
            
            expect(resposta.status).to.equal(400);
            expect(resposta.body).to.have.property('error', 'Usuário remetente ou destinatário não encontrado');
        });
        
        it('Quando informo valores válidos eu tenho sucesso com 201 CREATED', async () => {
            const resposta = await request('http://localhost:3000')
                .post('/transfers')
                .set('Authorization', `Bearer ${this.tokens}`)
                .send({
                    from: "julio",
                    to: "priscila",
                    value: 100
                });
            //console.log(resposta.body);
            expect(resposta.status).to.equal(201);
            expect(resposta.body).to.have.property('from', 'julio');
            expect(resposta.body).to.have.property('to', 'priscila');
            expect(resposta.body).to.have.property('value', 100);            

        });

        it('Quando informo valores válidos eu tenho sucesso com 201 CREATED e comparo com a fixture', async () => {
            const resposta = await request('http://localhost:3000')
                .post('/transfers')
                .set('Authorization', `Bearer ${this.tokens}`)
                .send({
                    from: "julio",
                    to: "priscila",
                    value: 100
                });
            
            // Validação com um Fixture
            const respostaEsperada = require('../fixture/respostas/valoresValidosCom201CreatedSucesso.json');
            // Esses delete serve para desprezar as propriedades dinâmicas, ex.: data será ignorada
            delete resposta.body.date;
            delete respostaEsperada.date;
            // deep.equal = eql = > comparar os objetos e propriedade de maneira recursiva, independe da ordem apresentada
            expect(resposta.body).to.deep.equal(respostaEsperada);
        });
    });
});