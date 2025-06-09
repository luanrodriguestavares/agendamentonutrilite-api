const sequelize = require("../config/database")

const User = require("./User")
const AgendamentoTime = require("./AgendamentoTime")
const HomeOffice = require("./HomeOffice")
const SolicitacaoLanche = require("./SolicitacaoLanche")
const AgendamentoVisitante = require("./AgendamentoVisitante")
const CoffeeBreak = require("./CoffeeBreak")
const RotaExtra = require("./RotaExtra")

const models = {
    User,
    AgendamentoTime,
    HomeOffice,
    SolicitacaoLanche,
    AgendamentoVisitante,
    CoffeeBreak,
    RotaExtra,
}

const syncModels = async () => {
    try {
        await sequelize.sync({ force: false, alter: true })
        console.log("Todas as tabelas foram sincronizadas com sucesso!")

        const tables = await sequelize.getQueryInterface().showAllTables()
        console.log("Tabelas existentes no banco:", tables)

        return true
    } catch (error) {
        console.error("Erro ao sincronizar modelos:", error)
        return false
    }
}

module.exports = {
    sequelize,
    models,
    syncModels,
}
