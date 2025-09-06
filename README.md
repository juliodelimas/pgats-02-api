# API de Transferências e Usuários

Esta API permite o registro, login, consulta de usuários e transferências de valores entre usuários. O objetivo é servir de base para estudos de testes e automação de APIs.

## Tecnologias
- Node.js
- Express
- Swagger (documentação)
- Banco de dados em memória (variáveis)

## Instalação

1. Clone o repositório:
   ```sh
   git clone <repo-url>
   cd pgats-02-api
   ```
2. Instale as dependências:
   ```sh
   npm install express swagger-ui-express bcryptjs
   ```
## Configuração

Antes de seguir, crie um arquivo .env na pasta raiz contendo as propriedades BASE_URL_REST E BASE_URL_GRAPHQL, com a URL desses serviços.

## Como rodar

- Para iniciar o servidor:
  ```sh
  node server.js
  ```
- A API estará disponível em `http://localhost:3000`
- A documentação Swagger estará em `http://localhost:3000/api-docs`

## Endpoints principais

### Registro de usuário
- `POST /users/register`
  - Body: `{ "username": "string", "password": "string", "favorecidos": ["string"] }`

### Login
- `POST /users/login`
  - Body: `{ "username": "string", "password": "string" }`

### Listar usuários
- `GET /users`

### Transferências
- `POST /transfers`
  - Body: `{ "from": "string", "to": "string", "value": number }`
- `GET /transfers`

### GraphQL Types, Queries e Mutations

Rode `npm run start-graphql` para executar a API do GraphQL e acesse a URL http://localhost:4000/graphql para acessá-la.

- **Types:**
  - `User`: username, favorecidos, saldo
  - `Transfer`: from, to, value, date
- **Queries:**
  - `users`: lista todos os usuários
  - `transfers`: lista todas as transferências (requer autenticação JWT)
- **Mutations:**
  - `registerUser(username, password, favorecidos)`: retorna User
  - `loginUser(username, password)`: retorna token + User
  - `createTransfer(from, to, value)`: retorna Transfer (requer autenticação JWT)

## Regras de negócio
- Não é permitido registrar usuários duplicados.
- Login exige usuário e senha.
- Transferências acima de R$ 5.000,00 só podem ser feitas para favorecidos.
- O saldo inicial de cada usuário é de R$ 10.000,00.

## Testes
- O arquivo `app.js` pode ser importado em ferramentas de teste como Supertest.
- Para testar a API GraphQL, importe `graphql/app.js` nos testes.

---

Para dúvidas, consulte a documentação Swagger, GraphQL Playground ou o código-fonte.
