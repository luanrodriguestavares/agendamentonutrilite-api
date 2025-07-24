const { Router } = require("express")
const AuthController = require("./controllers/AuthController")
const AgendamentoController = require("./controllers/AgendamentoController")
const authMiddleware = require("./middlewares/auth")

const routes = Router()

// Rota de teste para verificar se a API está funcionando
routes.get("/test", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "API está funcionando corretamente!",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    })
})

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
