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

### Relatórios de Testes com Mochawesome

Para gerar relatórios de testes em formato HTML e JSON, instale o pacote [mochawesome](https://github.com/adamgruber/mochawesome) como dependência de desenvolvimento:

```sh
npm install -D mochawesome
```

O `mochawesome` é um repórter para o framework de testes Mocha, que permite criar relatórios visuais e detalhados dos testes automatizados. Após instalar, você pode rodar seus testes com o seguinte comando para gerar o relatório:

```sh
mocha --reporter mochawesome
```

O relatório será gerado na pasta `mochawesome-report` do projeto.

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

## Regras de negócio
- Não é permitido registrar usuários duplicados.
- Login exige usuário e senha.
- Transferências acima de R$ 5.000,00 só podem ser feitas para favorecidos.
- O saldo inicial de cada usuário é de R$ 10.000,00.

## Testes
- O arquivo `app.js` pode ser importado em ferramentas de teste como Supertest.

---

Para dúvidas, consulte a documentação Swagger ou o código-fonte.
