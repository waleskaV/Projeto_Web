# Backend Web — MongoDB, JWT, REST e GraphQL

Backend de uma aplicação web desenvolvido em **Node.js**, utilizando **Express**, **MongoDB**, **Mongoose**, **JWT (JSON Web Token)** e **GraphQL**.

O projeto foi desenvolvido com finalidade acadêmica e demonstra conceitos importantes de desenvolvimento backend, como persistência de dados, autenticação, autorização por perfil, relacionamento entre dados, criação de APIs RESTful e uso de GraphQL.

---

## Objetivo do projeto

O objetivo deste projeto é desenvolver o backend de uma aplicação web capaz de:

- cadastrar e autenticar usuários;
- armazenar dados no MongoDB;
- controlar o acesso por meio de autenticação com JWT;
- diferenciar usuários por perfil;
- disponibilizar operações por API RESTful;
- disponibilizar consultas e alterações por GraphQL;
- organizar informações relacionadas a usuários, pacientes, médicos, consultas, especialidades e notificações.

---

## Tecnologias utilizadas

- **Node.js** — ambiente de execução JavaScript no backend;
- **Express** — criação do servidor e das rotas REST;
- **MongoDB Atlas** — banco de dados utilizado pela aplicação;
- **Mongoose** — modelagem e acesso aos dados do MongoDB;
- **JSON Web Token (JWT)** — autenticação e controle de acesso;
- **bcryptjs** — criptografia das senhas;
- **Apollo Server** — implementação da API GraphQL;
- **GraphQL** — linguagem de consulta da API;
- **dotenv** — leitura das configurações da aplicação;
- **Postman** — testes das requisições da API;

---

## Funcionalidades principais

A aplicação possui funcionalidades relacionadas ao gerenciamento de usuários e ao acesso seguro aos dados.

Entre as principais funcionalidades estão:

- cadastro de usuários;
- login;
- geração de token JWT;
- validação de token;
- autorização de acordo com o perfil do usuário;
- cadastro de dados de pacientes;
- cadastro de dados de médicos;
- associação de especialidades aos médicos;
- registro de disponibilidades;
- gerenciamento de consultas;
- registro de notificações;
- operações de consulta, cadastro, atualização e exclusão;
- acesso aos dados por REST;
- acesso aos dados por GraphQL.

---

## Modelo de dados e relacionamento entre entidades

O projeto utiliza o MongoDB como banco de dados.

O modelo principal da aplicação é o **Usuário**, que contém informações básicas de identificação e autenticação.

### Usuário

Os principais dados de um usuário são:

```text
nome
email
senha
perfil
```

O campo `perfil` permite identificar o tipo de usuário da aplicação, podendo representar, por exemplo:

```text
paciente
medico
admin
```

---

### Paciente

Quando o usuário possui dados de paciente, podem ser armazenadas informações como:

```text
documento
dataNascimento
telefone
planoSaude
contatoEmergencia
```

Essas informações complementam os dados básicos do usuário.

---

### Médico

Os dados específicos de um médico podem incluir:

```text
crm
especialidades
disponibilidades
```

O CRM identifica profissionalmente o médico.

---

### Especialidades

Um médico pode possuir uma ou mais especialidades.

Exemplo:

```text
especialidades
├── nome
└── descricao
```

As especialidades ajudam a identificar as áreas de atendimento de cada profissional.

---

### Disponibilidades

As disponibilidades representam os períodos em que determinado médico pode realizar atendimentos.

Exemplo:

```text
disponibilidades
├── data
├── horaInicio
├── horaFim
└── status
```

---

### Consultas

Uma consulta representa o relacionamento entre paciente, médico e atendimento.

Ela pode conter informações como:

```text
pacienteId
medicoId
especialidadeId
dataHora
status
motivo
criadoPor
canceladoEm
motivoCancelamento
```

---

### Notificações

As notificações podem ser utilizadas para informar usuários sobre acontecimentos relacionados às consultas.

Exemplo:

```text
destinatarioId
consultaId
tipo
mensagem
lida
criadaEm
```

Uma notificação pode estar relacionada a um usuário e a uma consulta específica.

---

## Segurança

A aplicação utiliza mecanismos de segurança para proteger os dados e controlar o acesso às funcionalidades.

### Criptografia de senhas

As senhas dos usuários não devem ser armazenadas diretamente no banco de dados.

Antes de serem salvas, elas são protegidas utilizando **bcryptjs**.

Exemplo:

```javascript
const senhaCriptografada = await bcrypt.hash(senha, 10);
```

Durante o login, a senha informada é comparada com a senha criptografada armazenada:

```javascript
const senhaValida = await bcrypt.compare(
  senha,
  usuario.senha
);
```

---

### Autenticação com JWT

Após um login válido, o servidor gera um **token JWT**.

Esse token pode armazenar informações importantes do usuário, como:

```text
id
email
perfil
```

Exemplo:

```javascript
const token = jwt.sign(
  {
    id: usuario._id,
    email: usuario.email,
    perfil: usuario.perfil
  },
  process.env.JWT_SECRET,
  {
    expiresIn: '1h'
  }
);
```

O token permite que o servidor reconheça o usuário nas próximas requisições.

---

### Bearer Token

Nas rotas protegidas, o token é enviado no cabeçalho da requisição:

```text
Authorization: Bearer SEU_TOKEN
```

O middleware de autenticação verifica:

- se o token foi enviado;
- se o formato está correto;
- se utiliza o padrão `Bearer`;
- se o token é válido;
- se o token ainda não expirou.

---

### Autorização por perfil

Além de verificar se o usuário está autenticado, a aplicação pode controlar quais perfis possuem acesso a determinadas operações.

Exemplo:

```javascript
autorizar('admin')
```

Dessa forma, uma funcionalidade administrativa pode ser acessada apenas por usuários autorizados.

---

## Interface RESTful

A aplicação disponibiliza operações utilizando o padrão **REST**.

O servidor recebe requisições HTTP e executa operações de acordo com a rota e o método utilizado.

### Principais métodos HTTP

| Método | Utilização |
|---|---|
| `GET` | Consultar informações |
| `POST` | Cadastrar informações |
| `PUT` | Atualizar informações |
| `DELETE` | Excluir informações |

---

### Cadastro

Exemplo de requisição:

```http
POST /auth/cadastro
```

A operação permite cadastrar um novo usuário.

Exemplo de dados enviados:

```json
{
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "senha": "Senha123"
}
```

---

### Login

```http
POST /auth/login
```

Exemplo:

```json
{
  "email": "maria@email.com",
  "senha": "Senha123"
}
```

Após um login válido, o backend retorna um token JWT que poderá ser utilizado nas rotas protegidas.

---

### Listagem de usuários

```http
GET /usuarios
```

Quando a rota estiver protegida, deve ser enviado:

```text
Authorization: Bearer SEU_TOKEN
```

---

### Cadastro de usuário

```http
POST /usuarios
```

Essa operação permite cadastrar um novo registro de usuário por meio da API REST.

---

### Atualização de usuário

```http
PUT /usuarios/:id
```

O `id` representa o identificador do usuário que será atualizado.

---

### Exclusão de usuário

```http
DELETE /usuarios/:id
```

A aplicação pode utilizar autenticação e autorização por perfil para permitir ou impedir a exclusão.

---

## Interface GraphQL

Além da API RESTful, o projeto também utiliza **GraphQL**.

O GraphQL permite que o cliente informe exatamente quais campos deseja receber.

O endpoint utilizado pelo projeto é:

```text
http://localhost:3000/graphql
```

---

### Query para listar usuários

```graphql
query {
  usuarios {
    id
    nome
    email
    perfil
  }
}
```

Essa consulta retorna apenas os campos solicitados.

---

### Query para buscar um usuário

```graphql
query {
  usuario(id: "ID_DO_USUARIO") {
    id
    nome
    email
    perfil
  }
}
```

---

### Mutation para cadastrar usuário

```graphql
mutation {
  cadastrarUsuario(
    nome: "Maria Silva"
    email: "maria@email.com"
    senha: "Senha123"
    perfil: "paciente"
  ) {
    id
    nome
    email
    perfil
  }
}
```

---

### Mutation para atualizar usuário

```graphql
mutation {
  atualizarUsuario(
    id: "ID_DO_USUARIO"
    nome: "Maria Souza"
    perfil: "paciente"
  ) {
    id
    nome
    email
    perfil
  }
}
```

---

### Mutation para excluir usuário

```graphql
mutation {
  excluirUsuario(id: "ID_DO_USUARIO")
}
```

---

## REST x GraphQL

O projeto utiliza duas formas de comunicação com o backend.

### REST

No REST, cada operação normalmente utiliza uma rota específica.

Exemplo:

```text
GET /usuarios
POST /usuarios
PUT /usuarios/:id
DELETE /usuarios/:id
```

### GraphQL

No GraphQL, as operações são enviadas para um único endpoint:

```text
/graphql
```

O cliente informa na query ou mutation quais dados deseja consultar ou modificar.

Isso permite demonstrar, dentro do mesmo projeto, duas abordagens diferentes para criação e consumo de APIs.

---

## Testes da API

As requisições podem ser testadas utilizando o **Postman**.

Com ele é possível verificar:

- cadastro;
- login;
- geração do token;
- acesso sem token;
- acesso com token válido;
- acesso com token inválido;
- permissões por perfil;
- operações de consulta;
- cadastro;
- alteração;
- exclusão;
- requisições GraphQL.


---

## Finalidade acadêmica

Este projeto foi desenvolvido com finalidade de estudo e prática de desenvolvimento web backend.

Ele permite aplicar, em um único sistema, conceitos relacionados a banco de dados, segurança, APIs, autenticação e diferentes formas de comunicação entre cliente e servidor.

---
