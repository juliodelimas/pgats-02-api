const request = require("supertest");
const sinon = require("sinon");
const { expect } = require("chai");
const app = require("../../app");

// Mock
const userService = require("../../service/userService");

// Testes
describe("Users Controller", () => {
  describe("GET /users", () => {
    beforeEach(async () => {
      // Reseta o Mock Julio colocou no final
      sinon.restore();
    });

    it("Listar todos os usuários", async () => {
      // Mocar apenas a função user do Service
      const userServiceMock = sinon.stub(userService, 'listUsers');
      userServiceMock.returns({ 
          username: "julio", 
          favorecidos: "priscila", 
          saldo: 10000
      });

      const resposta = await request(app)
        .get('/users')
        .send({ });

      expect(resposta.status).to.equal(200);
      //console.log(resposta.body);
      expect(resposta.body).to.deep.equal({
            username: 'julio',
            favorecidos: 'priscila',
            saldo: 10000
        });
    });
  });
});