# Sistema de Agendamento de Refeições - API

## Sobre o Projeto

API REST para o sistema de agendamento de refeições da Nutrilite. Gerencia agendamentos, usuários, notificações e regras de negócio.

## Tecnologias

- [Node.js](https://nodejs.org/) - Runtime JavaScript
- [Express](https://expressjs.com/) - Framework web
- [Sequelize](https://sequelize.org/) - ORM para Node.js
- [MySQL](https://www.mysql.com/) - Banco de dados
- [JWT](https://jwt.io/) - Autenticação
- [Nodemailer](https://nodemailer.com/) - Envio de emails
- [XLSX](https://www.npmjs.com/package/xlsx) - Geração de relatórios Excel
- [date-fns](https://date-fns.org/) - Manipulação de datas
- [bcryptjs](https://www.npmjs.com/package/bcryptjs) - Criptografia de senhas

## Arquitetura

```
api/
├── src/
│   ├── config/        # Configurações (banco de dados, email, etc)
│   ├── controllers/   # Controladores da aplicação
│   ├── middlewares/   # Middlewares Express
│   ├── models/        # Modelos Sequelize
│   ├── utils/         # Funções utilitárias
│   ├── app.js         # Configuração do Express
│   └── routes.js      # Rotas da API
└── .env              # Variáveis de ambiente
```

## Configuração

1. Clone o repositório
2. Instale as dependências:
```bash
cd api
yarn install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```
# Banco de dados
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASS=sua_senha
DB_NAME=agendamento_refeicao

# JWT
JWT_SECRET=seu_jwt_secret

# Email
EMAIL_HOST=smtp.exemplo.com
EMAIL_PORT=587
EMAIL_USER=seu_email
EMAIL_PASS=sua_senha
EMAIL_FROM=noreply@exemplo.com

# Frontend
FRONTEND_URL=http://localhost:5173
```

## Rodando o Projeto

```bash
# Desenvolvimento com hot-reload
yarn dev

# Produção
yarn start
```

## 📡 API Endpoints

### Autenticação

```
POST /auth/login
- Body: { email, senha }
- Response: { token, user }
```

### Agendamentos

```
GET    /agendamentos
- Query: { status, tipo, dataInicio, dataFim }
- Headers: { Authorization: Bearer token }

POST   /agendamentos
- Body: {
    tipoAgendamento,
    nome,
    email,
    timeSetor,
    dataInicio,
    dataFim,
    turno,
    centroCusto,
    quantidadeAlmocoLanche,
    quantidadeJantarCeia,
    quantidadeLancheExtra,
    ...campos específicos por tipo
  }

GET    /agendamentos/:id
PUT    /agendamentos/:id
DELETE /agendamentos/:id

POST   /agendamentos/:id/confirmar
- Headers: { Authorization: Bearer token }

POST   /agendamentos/:id/cancelar
- Body: { motivo, origem }

GET    /agendamentos/export
- Query: { dataInicio, dataFim }
- Headers: { Authorization: Bearer token }
- Response: arquivo Excel
```

## Modelos de Dados

### Agendamento

```javascript
{
  id: UUID,
  tipoAgendamento: ENUM(
    'Agendamento para Time',
    'Home Office',
    'Administrativo - Lanche',
    'Agendamento para Visitante',
    'Coffee Break',
    'Rota Extra'
  ),
  nome: STRING,
  email: STRING,
  status: ENUM('pendente', 'confirmado', 'cancelado'),
  timeSetor: STRING,
  dataInicio: DATE,
  dataFim: DATE,
  turno: STRING,
  centroCusto: STRING,
  refeitorio: STRING,
  quantidadeAlmocoLanche: INTEGER,
  quantidadeJantarCeia: INTEGER,
  quantidadeLancheExtra: INTEGER,
  quantidadeTiangua: INTEGER,
  quantidadeUbajara: INTEGER,
  motivo: STRING,
  canceladoPor: STRING,
  createdAt: DATE,
  updatedAt: DATE
}
```

### Usuário

```javascript
{
  id: UUID,
  nome: STRING,
  email: STRING,
  senha: STRING,
  role: ENUM('admin'),
  createdAt: DATE,
  updatedAt: DATE
}
```

## Notificações por Email

O sistema envia emails automáticos usando templates HTML personalizados para:

1. **Novo Agendamento**
   - Confirmação de recebimento
   - Detalhes do agendamento
   - Link para cancelamento

2. **Confirmação**
   - Notificação de aprovação
   - Detalhes atualizados
   - Instruções adicionais

3. **Cancelamento**
   - Motivo do cancelamento
   - Detalhes do agendamento cancelado
   - Origem do cancelamento (admin/usuário)

## Segurança

- Autenticação via JWT
- Senhas criptografadas com bcrypt
- Validação de dados com middlewares
- CORS configurado para frontend
- Rate limiting para prevenção de abusos
- Sanitização de inputs
- Logs de ações importantes

## Validações

1. **Gerais**
   - Datas futuras para novos agendamentos
   - Email válido
   - Campos obrigatórios por tipo
   - Formato de dados correto

2. **Específicas**
   - Quantidade de pessoas > 0
   - Centro de custo válido
   - Período válido (início <= fim)
   - Turno válido (A, B, C)
   - Refeitório válido (Indústria/Agro)
