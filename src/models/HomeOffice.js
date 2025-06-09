const sequelize = require("../config/database")
const { DataTypes } = require("sequelize")
const createBaseAgendamento = require("./AgendamentoBase")

const HomeOffice = createBaseAgendamento(sequelize, "HomeOffice", "home_office", {
    timeSetor: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    dataInicio: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    dataFim: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    turno: {
        type: DataTypes.ENUM("A", "B", "ADM"),
        allowNull: false,
    },
    refeitorio: {
        type: DataTypes.ENUM("Fazenda", "Industria"),
        allowNull: false,
    },
    refeicoes: {
        type: DataTypes.JSON,
        allowNull: false,
    },
})

module.exports = HomeOffice
