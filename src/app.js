const express = require("express")
const cors = require("cors")
const routes = require("./routes")
const { models, syncModels } = require("./models")

require("dotenv").config()

const app = express()

app.use(cors())
app.use(express.json())
app.use(routes)

const createDefaultAdmin = async () => {
    try {
        const adminExists = await models.User.findOne({ where: { email: "admin@gmail.com" } })
        if (!adminExists) {
            await models.User.create({
                email: "admin@gmail.com",
                password: "admin123",
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
        console.log("Iniciando sincronização do banco de dados...")

        const syncSuccess = await syncModels()

        if (syncSuccess) {
            await createDefaultAdmin()
            console.log("Aplicação inicializada com sucesso!")
        } else {
            console.error("Falha na sincronização do banco de dados")
        }
    } catch (error) {
        console.error("Erro ao inicializar aplicação:", error)
    }
}

initializeApp()

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
})
