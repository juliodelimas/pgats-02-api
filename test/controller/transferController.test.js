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
        it('Quando informo remetente e destinatario inexistentes recebo 400', async () => {
            const resposta = await request(app)
                .post('/transfers')
                .send({
                    from: "julio",
                    to: "priscila",
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
                .send({
                    from: "julio",
                    to: "priscila",
                    value: 100
                });
            
            expect(resposta.status).to.equal(400);
            expect(resposta.body).to.have.property('error', 'Usuário remetente ou destinatário não encontrado')

            // Reseto o Mock
            sinon.restore();
        });

        it('Usando Mocks: Quando informo valores válidos eu tenho sucesso com 201 CREATED', async () => {
            // Preparando os Dados
                // Carregar o arquivo
                // Preparar a forma de ignorar os campos dinamicos

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
                .send({
                    from: "julio",
                    to: "priscila",
                    value: 100
                });
            
            expect(resposta.status).to.equal(201);

            // validação com fixture
            const respostaEsperada = require('../fixture/respostas/quandoInformoValoresValidosEuTenhoSucessoCom201Created.json');
            delete resposta.body.date;
            delete respostaEsperada.date; // remove o campo date da resposta esperada, pois o date é dinâmico
            expect(resposta.body).to.deep.equal(respostaEsperada); //deep.equal nao se importa com a ordem dos campos, recursivo
            
            // Um expect para comparar a Resposta.body com a String contida no arquivo
            // expect(resposta.body).to.have.property('from', 'julio');
            // expect(resposta.body).to.have.property('to', 'priscila');
            // expect(resposta.body).to.have.property('value', 100);

            console.log(resposta.body)

            // Reseto o Mock
            sinon.restore();
        });
    });

    describe('GET /transfers', () => {
        // Its ficam aqui
    });
});