const sequelize = require("../config/database")
const { DataTypes } = require("sequelize")
const createBaseAgendamento = require("./AgendamentoBase")

const AgendamentoTime = createBaseAgendamento(sequelize, "AgendamentoTime", "agendamentos_time", {
    timeSetor: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    centroCusto: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isFeriado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    dataInicio: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    dataFim: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    dataFeriado: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    turno: {
        type: DataTypes.ENUM("A", "B", "ADM"),
        allowNull: false,
    },
    quantidadeAlmocoLanche: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    quantidadeJantarCeia: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    quantidadeLancheExtra: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
})

module.exports = AgendamentoTime
