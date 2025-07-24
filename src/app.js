const express = require("express")
const cors = require("cors")
const routes = require("./routes")
const { models, syncModels } = require("./models")
const sequelize = require("./config/database")

require("dotenv").config()

const app = express()

app.use(cors())
app.use(express.json())
app.use(routes)

const createDefaultAdmin = async () => {
    try {
        const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || "servicosnutriliteagendamento@gmail.com"
        const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "nutrilite"

        const adminExists = await models.User.findOne({ where: { email: adminEmail } })
        if (!adminExists) {
            await models.User.create({
                email: adminEmail,
                password: adminPassword,
                role: "admin",
            })
            console.log("Usuário admin criado com sucesso!")
        }
    } catch (error) {
        console.error("Erro ao criar usuário admin:", error)
    }
}

const initializeApp = async () => {
    try {
        await sequelize.sync({ alter: true })
        console.log("Modelos sincronizados com o banco de dados.")

        await createDefaultAdmin()
        console.log("Aplicação inicializada com sucesso!")
    } catch (error) {
        console.error("Erro ao inicializar aplicação:", error)
    }
}

const PORT = process.env.PORT || 3001
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`)
    initializeApp()
})
