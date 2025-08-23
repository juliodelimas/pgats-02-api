const request = require("supertest");
const { expect } = require("chai");
const app = require("../../app");

describe("Transfer External", () => {
  it("Deve retornar erro para usuários inexistentes via HTTP", async () => {
    const resposta = await request(app).post("/transfers").send({
      from: "julio",
      to: "priscila",
      value: 100,
    });
    expect(resposta.status).to.equal(400);
    expect(resposta.body).to.have.property(
      "error",
      "Usuário remetente ou destinatário não encontrado"
    );
  });
});
