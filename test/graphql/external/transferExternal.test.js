// Bibliotecas
const request = require('supertest');
const { expect } = require('chai');

// Testes
describe('Transfer', () => {
    let token

    describe('Mutation Transfer - GraphQL', () => {
        beforeEach(async () => {
            const respostaLogin = await request('http://localhost:4000')
                .post('/graphql')
                .send({
                     query: `
                        mutation LoginUser($username: String!, $password: String!) {
                            loginUser(username: $username, password: $password) {
                                token
                                user {
                                    username
                                }
                            }
                        }
                    `,
                     variables: {
                        "username": "Andre",
                        "password": "123456"
                    }

                });

            token = respostaLogin.body.data.loginUser.token;
        });


        it('a) Validar transferência com sucesso quando envio valores válidos', async () => {
            const resposta = await request('http://localhost:4000')
                .post('/graphql')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    query: `
                        mutation CreateTransfer($from: String!, $to: String!, $value: Float!) {
                            createTransfer(from: $from, to: $to, value: $value) {
                                from
                                to
                                value
                                date
                            }
                        }
                    `,
                    variables: {
                        "from": "Andre",
                        "to": "Sam",
                        "value": 100
                    }
                   
                });
            
            expect(resposta.status).to.equal(200);
            
            // Validação com um Fixture
            const respostaEsperada = require('../fixture/respostas/transferData.json')
            delete resposta.body.data.createTransfer.date;
            delete respostaEsperada.date; 
            expect(resposta.body.data.createTransfer).to.deep.equal(respostaEsperada);
        });

        it('b) Validar saldo indisponível para transferência', async () => {
            const resposta = await request("http://localhost:4000")
                .post('/graphql')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    query: `
                        mutation CreateTransfer($from: String!, $to: String!, $value: Float!) {
                            createTransfer(from: $from, to: $to, value: $value) {
                                from
                                to
                                value
                                date
                            }
                        }
                    `,
                    variables: {
                        "from": "Sam",
                        "to": "Andre",
                        "value": 20000
                    }
            });
            
            expect(resposta.status).to.equal(200);
            expect(resposta.body.errors[0]).to.have.property('message', 'Saldo insuficiente');
        });

        it('c) Validar mensagem de token de autenticação não informado', async () => {
            const resposta = await request("http://localhost:4000")
                .post('/graphql')
               // .set('Authorization', `Bearer ${token}`)
                .send({
                    query: `
                        mutation CreateTransfer($from: String!, $to: String!, $value: Float!) {
                            createTransfer(from: $from, to: $to, value: $value) {
                                from
                                to
                                value
                                date
                            }
                        }
                    `,
                    variables: {
                        "from": "Andre",
                        "to": "Sam",
                        "value": 10
                    }
            });
            
            expect(resposta.status).to.equal(200);
            expect(resposta.body.errors[0]).to.have.property('message', 'Autenticação obrigatória');
        });
   
    });
});