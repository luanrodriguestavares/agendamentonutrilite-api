const sequelize = require("../config/database")
const { DataTypes } = require("sequelize")
const createBaseAgendamento = require("./AgendamentoBase")

const CoffeeBreak = createBaseAgendamento(sequelize, "CoffeeBreak", "coffee_breaks", {
    timeSetor: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    turno: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    cardapio: {
        type: DataTypes.ENUM("Coffe Tipo 01", "Coffe Tipo 02", "Coffe Tipo 03", "Coffe Tipo 04", "Coffe Tipo 05"),
        allowNull: false,
    },
    quantidade: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
    },
    centroCusto: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    rateio: {
        type: DataTypes.ENUM("Sim", "Não"),
        allowNull: false,
    },
    dataCoffee: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    horario: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    localEntrega: {
        type: DataTypes.STRING,
        allowNull: false,
    },
})

module.exports = CoffeeBreak
