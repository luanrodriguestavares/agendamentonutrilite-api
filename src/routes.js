const { Router } = require("express")
const AuthController = require("./controllers/AuthController")
const AgendamentoController = require("./controllers/AgendamentoController")
const authMiddleware = require("./middlewares/auth")

const routes = Router()

// Rotas públicas
routes.post("/auth/login", AuthController.login)
routes.post("/agendamentos", AgendamentoController.create.bind(AgendamentoController))
routes.put("/agendamentos/:id/cancel", AgendamentoController.cancel.bind(AgendamentoController))

// Rotas protegidas (requerem autenticação)
routes.use(authMiddleware)
routes.get("/agendamentos", AgendamentoController.list.bind(AgendamentoController))
routes.get("/agendamentos/export/xlsx", AgendamentoController.exportXLSX.bind(AgendamentoController))
routes.get("/agendamentos/:id", AgendamentoController.show.bind(AgendamentoController))
routes.put("/agendamentos/:id", AgendamentoController.update.bind(AgendamentoController))

module.exports = routes
