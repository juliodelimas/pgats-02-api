// Bibliotecas
const request = require('supertest');
const sinon = require('sinon');
const { expect } = require('chai');

// Mock & Helpers - IMPORTANTE: Mockar ANTES de importar o app
const transferService = require('../../service/transferService');
const userService = require('../../service/userService');
const authMiddleware = require('../../middleware/authMiddleware');

// Mock do middleware ANTES de importar o app
const authMiddlewareMock = sinon.stub(authMiddleware, 'authenticateToken');
authMiddlewareMock.callsFake((req, res, next) => {
    req.user = { 
        username: 'henrique',
        saldo: 10000,
        favorecidos: ['bruna'] 
    };
    next(); // Sempre autoriza
});

// Aplicação - DEPOIS do mock
const app = require('../../app');

describe('Transfer Controller', () => {
    before(() => {
        console.log('🔐 Middleware mockado - testes focados na lógica de transferência');
    });

    after(() => {
        if (authMiddlewareMock) {
            authMiddlewareMock.restore();
        }
    });

    describe('POST /transfers', () => {
        it('Unit: Quando informo remetente e destinatario inexistentes recebo 400', async () => {
            const resposta = await request(app)
                .post('/transfers')
                .send({
                    from: "julio",
                    to: "priscila", 
                    value: 100
                });
            
            expect(resposta.status).to.equal(400);
            expect(resposta.body).to.have.property('error', 'Usuário remetente ou destinatário não encontrado');
        });

        it('Unit: Com mock do service, remetente inexistente recebo 400', async () => {
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
            expect(resposta.body).to.have.property('error', 'Usuário remetente ou destinatário não encontrado');
            
            transferServiceMock.restore(); // ← Simples assim!
        });

        it('Unit: Com mock do service, valores válidos retorno 201', async () => {
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
            delete respostaEsperada.date;
            expect(resposta.body).to.deep.equal(respostaEsperada);

            console.log(resposta.body);
            
            transferServiceMock.restore(); // ← Simples assim!
        });

        it('Integration: Com JWT real, remetente inexistente recebo 400', async () => {
            // Remover mock temporariamente para este teste
            authMiddlewareMock.restore();
            
            const { getAuthHeaders } = require('../helpers/authHelper');
            const authHeaders = await getAuthHeaders('henrique', '123456');
            
            const resposta = await request(app)
                .post('/transfers')
                .set(authHeaders) // JWT real
                .send({
                    from: "usuario-inexistente",
                    to: "bruna",
                    value: 100
                });
            
            expect(resposta.status).to.equal(400);
            expect(resposta.body).to.have.property('error', 'Usuário remetente ou destinatário não encontrado');
            
            // Restaurar mock para próximos testes (se houver)
            sinon.stub(authMiddleware, 'authenticateToken').callsFake((req, res, next) => {
                req.user = { username: 'henrique', saldo: 10000, favorecidos: ['bruna'] };
                next();
            });
        });
    });
});