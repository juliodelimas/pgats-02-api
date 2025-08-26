// Bibliotecas
const request = require('supertest');
const sinon = require('sinon');
const { expect } = require('chai');

// Aplicação
const app = require('../../app');

// Mock
const transferService = require('../../service/transferService');

// Testes
describe('Transfer Controller', () => {
    describe('POST /transfers', () => {
        
        beforeEach(async () => {
            const respostaLogin = await request(app)
                .post('/users/login')
                .send({
                    username: 'julio',
                    password: '123456'
                });
            this.tokens = respostaLogin.body.token;
            
            // Reseta o Mock Julio colocou no final
            sinon.restore();
        })
        
        it('Quando informo remetente e destinatario inexistentes recebo 400', async () => {
            const resposta = await request(app)
                .post('/transfers')
                .set('Authorization', `Bearer ${this.tokens}`)
                .send({
                    from: "julio",
                    to: "izabelle",
                    value: 100
                });
            
            expect(resposta.status).to.equal(400);
            expect(resposta.body).to.have.property('error', 'Usuário remetente ou destinatário não encontrado')
        });

        it('Usando Mocks: Quando informo remetente e destinatario inexistentes recebo 400', async () => {
            // Mocar apenas a função transfer do Service
            const transferServiceMock = sinon.stub(transferService, 'transfer');
            transferServiceMock.throws(new Error('Usuário remetente ou destinatário não encontrado'));

            const resposta = await request(app)
                .post('/transfers')
                .set('Authorization', `Bearer ${this.tokens}`)
                .send({
                    from: "julio",
                    to: "priscila",
                    value: 100
                });
            
            expect(resposta.status).to.equal(400);
            expect(resposta.body).to.have.property('error', 'Usuário remetente ou destinatário não encontrado')

        });

        it('Usando Mocks: Quando informo valores válidos eu tenho sucesso com 201 CREATED', async () => {
            // Mocar apenas a função transfer do Service
            const transferServiceMock = sinon.stub(transferService, 'transfer');
            transferServiceMock.returns({ 
                from: "julio", 
                to: "priscila", 
                value: 100, 
                date: new Date().toISOString() 
            });

            const resposta = await request(app)
                .post('/transfers')
                .set('Authorization', `Bearer ${this.tokens}`)
                .send({
                    from: "julio",
                    to: "priscila",
                    value: 100
                });
            
            expect(resposta.status).to.equal(201);
            expect(resposta.body).to.have.property('from', 'julio');
            expect(resposta.body).to.have.property('to', 'priscila');
            expect(resposta.body).to.have.property('value', 100);

            //console.log((resposta.body));
            
        });

        it('Usando Mocks: Quando informo valores válidos eu tenho sucesso com 201 CREATED e comparo com a fixture', async () => {
            // Mocar apenas a função transfer do Service
            const transferServiceMock = sinon.stub(transferService, 'transfer');
            transferServiceMock.returns({ 
                from: "julio", 
                to: "priscila", 
                value: 100, 
                date: new Date().toISOString() 
            });

            const resposta = await request(app)
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

           // console.log((resposta.body));
           
        });
    });

    describe('GET /transfers', () => {
        // Its ficam aqui
    });
});