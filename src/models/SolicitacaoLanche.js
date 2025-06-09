const sequelize = require("../config/database")
const { DataTypes } = require("sequelize")
const createBaseAgendamento = require("./AgendamentoBase")

const SolicitacaoLanche = createBaseAgendamento(sequelize, "SolicitacaoLanche", "solicitacoes_lanche", {
    timeSetor: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    data: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    turno: {
        type: DataTypes.ENUM("A", "ADM"),
        allowNull: false,
    },
    refeitorio: {
        type: DataTypes.ENUM("Fazenda", "Industria"),
        allowNull: false,
    },
    refeicoes: {
        type: DataTypes.STRING,
        defaultValue: "Lanche Individual",
    },
})

module.exports = SolicitacaoLanche
