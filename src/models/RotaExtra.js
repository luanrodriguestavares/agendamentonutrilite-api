const sequelize = require("../config/database")
const { DataTypes } = require("sequelize")
const createBaseAgendamento = require("./AgendamentoBase")

const RotaExtra = createBaseAgendamento(sequelize, "RotaExtra", "rotas_extra", {
    timeSetor: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    centroCusto: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    dia: {
        type: DataTypes.ENUM("Feriado", "Sabado", "Domingo", "Dia Util"),
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
    quantidadeTiangua: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
    },
    quantidadeUbajara: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
    },
    diasSemana: {
        type: DataTypes.JSON,
        allowNull: true,
    },
})

module.exports = RotaExtra
