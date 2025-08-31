// test/external/transferExternal.test.js
const path = require("path");
const fs = require("fs");

// Carrega .env (com debug)
const envPath = path.resolve(process.cwd(), ".env");
if (!fs.existsSync(envPath)) {
  console.error("❌ .env não encontrado em:", envPath);
}
require("dotenv").config({ path: envPath, debug: true });

const request = require("supertest");
const { expect } = require("chai");

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:4000";
const GRAPHQL_PATH = process.env.GRAPHQL_PATH || "/graphql";

const LOGIN_USERNAME = process.env.LOGIN_USERNAME; // alice
const LOGIN_PASSWORD = process.env.LOGIN_PASSWORD; // 123456

const SENDER_OK_ID = process.env.SENDER_OK_ID; // alice
const RECEIVER_OK_ID = process.env.RECEIVER_OK_ID; // bob
const SENDER_NO_FUNDS_ID = process.env.SENDER_NO_FUNDS_ID; // user_sem_saldo

const AMOUNT_SUCCESS = Number(process.env.AMOUNT_SUCCESS || 50);
const AMOUNT_NO_FUNDS = Number(process.env.AMOUNT_NO_FUNDS || 999999);

function gql(query, variables = {}, token) {
  let req = request(API_BASE_URL)
    .post(GRAPHQL_PATH)
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .send({ query, variables });
  if (token) req = req.set("Authorization", `Bearer ${token}`);
  return req;
}

/** Seed idempotente: cria usuário e ignora "já existe" */
async function ensureUser(username, password, favorecidos = []) {
  // registerUser retorna User! -> precisa selecionar subcampos
  const REGISTER = `
    mutation Register($u: String!, $p: String!, $f: [String!]) {
      registerUser(username: $u, password: $p, favorecidos: $f) {
        username
      }
    }
  `;
  const res = await gql(REGISTER, { u: username, p: password, f: favorecidos });

  if (res.body?.errors?.length) {
    const msg = (res.body.errors[0].message || "").toLowerCase();
    if (msg.includes("já existe") || msg.includes("exists")) return; // ok, já criado
    throw new Error(
      `Falha ao registrar ${username}: ${res.body.errors[0].message}`
    );
  }

  const user = res.body?.data?.registerUser;
  if (!user?.username) {
    throw new Error(
      `Registro de ${username} sem User válido: ${JSON.stringify(res.body)}`
    );
  }
}

async function getJwt() {
  // loginUser(username, password): AuthPayload! -> selecionar subcampos
  const LOGIN_MUTATION = `
    mutation Login($u: String!, $p: String!) {
      loginUser(username: $u, password: $p) {
        token
      }
    }
  `;
  const res = await gql(LOGIN_MUTATION, {
    u: LOGIN_USERNAME,
    p: LOGIN_PASSWORD,
  });

  if (res.body?.errors?.length) {
    console.error("❌ Login errors:", JSON.stringify(res.body.errors, null, 2));
    throw new Error(res.body.errors[0]?.message || "Erro no login GraphQL");
  }

  const token = res.body?.data?.loginUser?.token;
  if (!token) {
    console.error(
      "❌ Resposta de login inesperada:",
      JSON.stringify(res.body, null, 2)
    );
    throw new Error("Token não retornado por loginUser");
  }
  return token;
}

describe("Transfers Mutation (External)", function () {
  this.timeout(20000);

  let jwt;

  before(async () => {
    const missing = [];
    if (!LOGIN_USERNAME) missing.push("LOGIN_USERNAME");
    if (!LOGIN_PASSWORD) missing.push("LOGIN_PASSWORD");
    if (!SENDER_OK_ID) missing.push("SENDER_OK_ID");
    if (!RECEIVER_OK_ID) missing.push("RECEIVER_OK_ID");
    if (!SENDER_NO_FUNDS_ID) missing.push("SENDER_NO_FUNDS_ID");
    if (missing.length) {
      throw new Error(
        `Defina no .env: ${missing.join(
          ", "
        )} (um por linha, sem comentários inline).`
      );
    }

    // garantir usuários
    await ensureUser(RECEIVER_OK_ID, "123456"); // bob
    await ensureUser(SENDER_NO_FUNDS_ID, "123456"); // user_sem_saldo
    await ensureUser(SENDER_OK_ID, "123456", [RECEIVER_OK_ID]); // alice com bob como favorecido

    // login
    jwt = await getJwt();
  });

  it("a) Transferência com sucesso", async () => {
    const TRANSFER = `
      mutation DoTransfer($from: String!, $to: String!, $value: Float!) {
        createTransfer(from: $from, to: $to, value: $value) {
          __typename
        }
      }
    `;
    const res = await gql(
      TRANSFER,
      { from: SENDER_OK_ID, to: RECEIVER_OK_ID, value: AMOUNT_SUCCESS },
      jwt
    );

    // foco: não pode haver 'errors'
    if (res.body?.errors?.length) {
      console.error("❌ Erros em transferência de sucesso:", {
        status: res.status,
        errors: res.body.errors,
      });
    }
    expect(
      res.body.errors,
      `Status=${res.status}, body=${JSON.stringify(res.body)}`
    ).to.be.undefined;

    // retorno deve existir e conter um objeto (tem __typename)
    expect(res.body?.data?.createTransfer?.__typename).to.be.a("string");
  });

  it("b) Sem saldo disponível", async () => {
    const TRANSFER = `
      mutation DoTransfer($from: String!, $to: String!, $value: Float!) {
        createTransfer(from: $from, to: $to, value: $value) {
          __typename
        }
      }
    `;
    const res = await gql(
      TRANSFER,
      { from: SENDER_NO_FUNDS_ID, to: RECEIVER_OK_ID, value: AMOUNT_NO_FUNDS },
      jwt
    );

    // Aceita 200 ou 400; deve haver errors com mensagem adequada
    expect([200, 400]).to.include(res.status);
    expect(res.body.errors, "Era esperado erro por saldo insuficiente").to
      .exist;

    const msg = (res.body.errors?.[0]?.message || "").toLowerCase();
    expect(msg, `Mensagem inesperada: ${msg}`).to.match(
      /(saldo|insuficiente|insufficient|funds|sem\s+saldo|balance)/
    );
  });

  it("c) Token de autenticação não informado", async () => {
    const TRANSFER = `
      mutation DoTransfer($from: String!, $to: String!, $value: Float!) {
        createTransfer(from: $from, to: $to, value: $value) {
          __typename
        }
      }
    `;
    const res = await gql(TRANSFER, {
      from: SENDER_OK_ID,
      to: RECEIVER_OK_ID,
      value: AMOUNT_SUCCESS,
    }); // sem token

    // Algumas APIs: 401/403. Em Apollo: 200/400 com errors "Unauthorized"
    if ([401, 403].includes(res.status)) {
      expect(res.status).to.be.oneOf([401, 403]);
    } else {
      expect([200, 400]).to.include(res.status);
      expect(res.body.errors, "Esperava errors quando sem auth").to.exist;
      const msg = (res.body.errors?.[0]?.message || "").toLowerCase();
      expect(msg).to.match(
        /(unauth|forbidden|não\s*autorizado|token|jwt|autentic[aã]o\s*obrigat[oó]ria|autentic|auth)/
      );
    }
  });
});
