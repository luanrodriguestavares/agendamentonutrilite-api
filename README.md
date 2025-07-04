# Sistema de Agendamento de Refeições - API

## Sobre o Projeto

API REST completa para o sistema de agendamento de refeições da Nutrilite. Gerencia múltiplos tipos de agendamentos, usuários, notificações por email, validações de horários e regras de negócio específicas.

## Tecnologias Utilizadas

### Core

- **[Node.js](https://nodejs.org/)** - Runtime JavaScript
- **[Express](https://expressjs.com/)** - Framework web
- **[Sequelize](https://sequelize.org/)** - ORM para Node.js
- **[MySQL](https://www.mysql.com/)** - Banco de dados relacional

### Autenticação & Segurança

- **[JWT (jsonwebtoken)](https://jwt.io/)** - Autenticação via tokens
- **[bcryptjs](https://www.npmjs.com/package/bcryptjs)** - Criptografia de senhas

### Comunicação & Notificações

- **[Nodemailer](https://nodemailer.com/)** - Envio de emails com templates HTML
- **[CORS](https://www.npmjs.com/package/cors)** - Cross-Origin Resource Sharing

### Manipulação de Dados

- **[date-fns](https://date-fns.org/)** - Manipulação avançada de datas com locale pt-BR
- **[moment](https://momentjs.com/)** - Manipulação adicional de datas
- **[XLSX](https://www.npmjs.com/package/xlsx)** - Geração de relatórios Excel
- **[UUID](https://www.npmjs.com/package/uuid)** - Geração de IDs únicos

### Desenvolvimento

- **[Nodemon](https://nodemon.io/)** - Hot-reload para desenvolvimento
- **[dotenv](https://www.npmjs.com/package/dotenv)** - Gerenciamento de variáveis de ambiente

## Arquitetura do Projeto

```
api/
├── src/
│   ├── config/
│   │   └── database.js          # Configuração do Sequelize
│   ├── controllers/
│   │   ├── AuthController.js    # Autenticação e login
│   │   └── AgendamentoController.js # CRUD de agendamentos
│   ├── middlewares/
│   │   └── auth.js              # Middleware de autenticação JWT
│   ├── models/
│   │   ├── index.js             # Exportação centralizada dos modelos
│   │   ├── AgendamentoBase.js   # Modelo base para agendamentos
│   │   ├── User.js              # Modelo de usuários
│   │   ├── AgendamentoTime.js   # Agendamentos para times
│   │   ├── HomeOffice.js        # Agendamentos home office
│   │   ├── SolicitacaoLanche.js # Solicitações de lanche
│   │   ├── AgendamentoVisitante.js # Agendamentos para visitantes
│   │   ├── CoffeeBreak.js       # Coffee breaks
│   │   └── RotaExtra.js         # Rotas extras
│   ├── utils/
│   │   ├── email.js             # Sistema de emails com templates
│   │   └── agendamentoUtils.js  # Validações de horários
│   ├── app.js                   # Configuração do Express
│   └── routes.js                # Definição das rotas
├── .env                         # Variáveis de ambiente
├── .gitignore                   # Arquivos ignorados pelo Git
├── package.json                 # Dependências e scripts
├── yarn.lock                    # Lock file do Yarn
└── README.md                    # Documentação
```

## Configuração e Instalação

### Pré-requisitos

- Node.js (versão 14 ou superior)
- MySQL (versão 5.7 ou superior)
- Yarn ou npm

### 1. Clone o Repositório

```bash
git clone <url-do-repositorio>
cd AgendamentoRefeicao/api
```

### 2. Instale as Dependências

```bash
yarn install
# ou
npm install
```

### 3. Configure o Banco de Dados

Crie um banco de dados MySQL:

```sql
CREATE DATABASE agendamento_nutrilite;
```

### 4. Configure as Variáveis de Ambiente

Crie um arquivo `.env` baseado no exemplo:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# URL do Frontend
FRONTEND_URL=http://localhost:5173

# Configurações do Servidor
PORT=3001

# Configurações do Banco de Dados
DB_HOST=localhost
DB_USER=root
DB_PASS=sua_senha_mysql
DB_NAME=agendamento_nutrilite

# Configurações JWT
JWT_SECRET=sua_chave_secreta_jwt_super_segura

# Configurações do Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app_gmail
EMAIL_FROM=seu_email@gmail.com
ENABLE_EMAILS=true
```

### 5. Configuração do Email (Gmail)

Para usar Gmail, você precisa:

1. Ativar autenticação de 2 fatores
2. Gerar uma senha de app específica
3. Usar essa senha no `EMAIL_PASS`

### 6. Sincronize o Banco de Dados

```bash
yarn dev
```

O sistema criará automaticamente todas as tabelas na primeira execução.

### 7. Usuário Admin Padrão

O sistema cria automaticamente um usuário admin:

- **Email:** admin@gmail.com
- **Senha:** admin123

## Executando o Projeto

### Desenvolvimento (com hot-reload)

```bash
yarn dev
```

### Produção

```bash
yarn start
```

O servidor estará disponível em `http://localhost:3001`

## 📡 API Endpoints

### Autenticação

#### `POST /auth/login`

Autentica um usuário e retorna um token JWT.

**Body:**

```json
{
  "email": "admin@gmail.com",
  "password": "admin123"
}
```

**Response:**

```json
{
  "user": {
    "id": 1,
    "email": "admin@gmail.com",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Agendamentos

#### `POST /agendamentos`

Cria um novo agendamento (rota pública).

**Headers:** Nenhum (rota pública)

**Body:** Varia conforme o tipo de agendamento (veja seção de modelos)

**Response:**

```json
{
  "id": "uuid-do-agendamento",
  "nome": "João Silva",
  "email": "joao@exemplo.com",
  "tipoAgendamento": "Agendamento para Time",
  "status": "pendente",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

#### `GET /agendamentos`

Lista todos os agendamentos (rota protegida).

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `status` - Filtrar por status (pendente, confirmado, cancelado)
- `tipo` - Filtrar por tipo de agendamento
- `dataInicio` - Data de início para filtro
- `dataFim` - Data de fim para filtro

#### `GET /agendamentos/:id`

Busca um agendamento específico (rota protegida).

**Headers:**

```
Authorization: Bearer <token>
```

#### `PUT /agendamentos/:id`

Atualiza um agendamento (rota protegida).

**Headers:**

```
Authorization: Bearer <token>
```

**Body:** Mesmo formato do POST, mas apenas os campos a serem atualizados.

#### `PUT /agendamentos/:id/cancel`

Cancela um agendamento (rota pública).

**Body:**

```json
{
  "tipo": "Agendamento para Time",
  "motivo": "Motivo do cancelamento",
  "origem": "usuario"
}
```

#### `GET /agendamentos/export/xlsx`

Exporta todos os agendamentos para Excel (rota protegida).

**Headers:**

```
Authorization: Bearer <token>
```

**Response:** Arquivo Excel (.xlsx)

## 📊 Modelos de Dados

### Modelo Base (AgendamentoBase)

Todos os agendamentos herdam estes campos:

```javascript
{
  id: UUID,                    // ID único gerado automaticamente
  nome: STRING,                // Nome do solicitante
  email: STRING,               // Email do solicitante
  tipoServico: STRING,         // Tipo de serviço (opcional)
  observacao: TEXT,            // Observações adicionais
  status: ENUM,                // pendente, confirmado, cancelado
  motivoCancelamento: TEXT,    // Motivo do cancelamento
  version: INTEGER,            // Controle de versão
  createdAt: DATE,             // Data de criação
  updatedAt: DATE              // Data de atualização
}
```

### 1. AgendamentoTime (agendamentos_time)

```javascript
{
  // Campos base +
  timeSetor: STRING,           // Nome do time/setor
  centroCusto: STRING,         // Centro de custo
  isFeriado: BOOLEAN,          // Se é feriado
  dataInicio: DATE,            // Data de início
  dataFim: DATE,               // Data de fim
  dataFeriado: DATE,           // Data específica do feriado
  turno: ENUM,                 // A, B, ADM
  quantidadeAlmocoLanche: INTEGER,  // Qtd de almoço/lanche
  quantidadeJantarCeia: INTEGER,    // Qtd de jantar/ceia
  quantidadeLancheExtra: INTEGER,   // Qtd de lanche extra
  refeitorio: ENUM             // Fazenda, Industria
}
```

### 2. HomeOffice (home_office)

```javascript
{
  // Campos base +
  timeSetor: STRING,           // Nome do time/setor
  dataInicio: DATE,            // Data de início
  dataFim: DATE,               // Data de fim
  turno: ENUM,                 // A, B, ADM
  refeitorio: ENUM,            // Fazenda, Industria
  refeicoes: JSON              // Array de refeições selecionadas
}
```

### 3. SolicitacaoLanche (solicitacoes_lanche)

```javascript
{
  // Campos base +
  timeSetor: STRING,           // Nome do time/setor
  data: DATE,                  // Data do lanche
  turno: ENUM,                 // A, ADM
  refeitorio: ENUM,            // Fazenda, Industria
  refeicoes: STRING            // "Lanche Individual" ou quantidade
}
```

### 4. AgendamentoVisitante (agendamentos_visitante)

```javascript
{
  // Campos base +
  data: DATE,                  // Data da visita
  refeitorio: ENUM,            // Fazenda, Industria
  quantidadeVisitantes: INTEGER, // Número de visitantes
  acompanhante: STRING,        // Nome do acompanhante
  centroCusto: STRING          // Centro de custo
}
```

### 5. CoffeeBreak (coffee_breaks)

```javascript
{
  // Campos base +
  timeSetor: STRING,           // Nome do time/setor
  turno: STRING,               // Turno
  cardapio: ENUM,              // Coffee Tipo 01-05
  quantidade: INTEGER,         // Quantidade de pessoas
  centroCusto: STRING,         // Centro de custo
  rateio: ENUM,                // Sim, Não
  dataCoffee: DATE,            // Data do coffee break
  horario: STRING,             // Horário
  localEntrega: STRING         // Local de entrega
}
```

### 6. RotaExtra (rotas_extra)

```javascript
{
  // Campos base +
  timeSetor: STRING,           // Nome do time/setor
  centroCusto: STRING,         // Centro de custo
  dia: ENUM,                   // Feriado, Sabado, Domingo
  dataInicio: DATE,            // Data de início
  dataFim: DATE,               // Data de fim
  quantidadeTiangua: INTEGER,  // Qtd para Tianguá
  quantidadeUbajara: INTEGER   // Qtd para Ubajara
}
```

### 7. User (users)

```javascript
{
  id: INTEGER,                 // ID auto-incremento
  email: STRING,               // Email único
  password: STRING,            // Senha criptografada
  role: ENUM,                  // admin
  createdAt: DATE,             // Data de criação
  updatedAt: DATE              // Data de atualização
}
```

## 📧 Sistema de Emails

### Configuração

O sistema usa Nodemailer com templates HTML personalizados para diferentes tipos de notificação.

### Tipos de Email

#### 1. Confirmação de Recebimento

- Enviado quando um agendamento é criado
- Inclui detalhes do agendamento
- Link para cancelamento
- Template responsivo com cores da Nutrilite

#### 2. Confirmação de Aprovação

- Enviado quando admin confirma agendamento
- Detalhes atualizados
- Instruções adicionais

#### 3. Cancelamento

- Enviado quando agendamento é cancelado
- Motivo do cancelamento
- Detalhes do agendamento cancelado
- Origem do cancelamento (admin/usuário)

#### 4. Erro de Cancelamento

- Enviado quando cancelamento não é permitido
- Explicação do motivo
- Regras de cancelamento

### Templates HTML

- Design responsivo
- Cores da marca Nutrilite (#059669)
- Informações organizadas em tabelas
- Links de cancelamento
- Rodapé com informações de contato

## ⏰ Validações de Horário

### Regras de Cancelamento

#### Coffee Break

- Cancelamento até 12:00h do dia anterior

#### Fins de Semana/Feriados

- **Almoço:** Cancelamento até 13:30h do dia anterior
- **Jantar/Ceia:** Cancelamento até 12:00h do dia solicitado

#### Dias Úteis

- **Almoço (Turno A/ADM):** Cancelamento até 07:35h do mesmo dia
- **Jantar/Ceia (Turno B):** Cancelamento até 09:05h do mesmo dia

#### Home Office

- **Dias úteis:** Almoço até 07:35h, Jantar/Ceia até 09:05h
- **Fins de semana:** Almoço até 13:30h do dia anterior, Jantar/Ceia até 12:00h do dia

### Validações Gerais

- Datas futuras para novos agendamentos
- Email válido
- Campos obrigatórios por tipo
- Formato de dados correto
- Quantidade de pessoas > 0
- Centro de custo válido
- Período válido (início <= fim)

## 🔐 Segurança

### Autenticação

- JWT com expiração de 7 dias
- Senhas criptografadas com bcrypt (salt rounds: 10)
- Middleware de autenticação em rotas protegidas

### Validação

- Sanitização de inputs
- Validação de tipos de dados
- Controle de versão para agendamentos
- Transações para operações críticas

### CORS

- Configurado para frontend específico
- Headers de segurança

## 📈 Relatórios

### Exportação Excel

- Todos os agendamentos em uma aba
- Abas separadas por tipo de agendamento
- Formatação de datas em pt-BR
- Headers em português
- Download direto via API

### Campos Exportados

- Nome do solicitante
- Email
- Status
- Tipo de agendamento
- Time/Setor
- Centro de custo
- Data de criação
- Motivo de cancelamento
- Observações

## 🚨 Tratamento de Erros

### Códigos de Status HTTP

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `401` - Não autorizado
- `404` - Não encontrado
- `500` - Erro interno

### Respostas de Erro

```json
{
  "error": "Mensagem de erro",
  "code": "CODIGO_ESPECIFICO",
  "details": "Detalhes adicionais"
}
```

## 🔧 Desenvolvimento

### Scripts Disponíveis

```bash
yarn dev      # Desenvolvimento com nodemon
yarn start    # Produção
```

### Estrutura de Desenvolvimento

- Hot-reload automático
- Logs detalhados
- Tratamento de erros em desenvolvimento
- Sincronização automática do banco

### Banco de Dados

- Sincronização automática na inicialização
- Criação de tabelas se não existirem
- Logs de sincronização

## 📝 Logs e Monitoramento

### Logs do Sistema

- Criação de agendamentos
- Cancelamentos
- Erros de validação
- Erros de email
- Sincronização do banco

### Monitoramento

- Status do servidor
- Conexão com banco de dados
- Configuração de email
- Usuário admin padrão
