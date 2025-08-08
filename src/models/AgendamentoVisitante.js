const sequelize = require("../config/database")
const { DataTypes } = require("sequelize")
const createBaseAgendamento = require("./AgendamentoBase")

const AgendamentoVisitante = createBaseAgendamento(sequelize, "AgendamentoVisitante", "agendamentos_visitante", {
    data: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    refeitorio: {
        type: DataTypes.ENUM("Fazenda", "Industria"),
        allowNull: false,
    },
    quantidadeVisitantes: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    acompanhante: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    centroCusto: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    rateio: {
        type: DataTypes.ENUM("Sim", "Não"),
        allowNull: false,
    },
})

module.exports = AgendamentoVisitante
