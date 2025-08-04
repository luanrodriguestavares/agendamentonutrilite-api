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
    
    quantidadeAlmoco: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    quantidadeLanche: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    quantidadeJantar: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    quantidadeCeia: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    refeitorio: {
        type: DataTypes.ENUM("Fazenda", "Industria"),
        allowNull: false,
    },
    diasSemana: {
        type: DataTypes.JSON,
        allowNull: true,
    },
})

module.exports = AgendamentoTime
