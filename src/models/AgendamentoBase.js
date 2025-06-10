const { DataTypes } = require("sequelize")
const { v4: uuidv4 } = require("uuid")

const createBaseAgendamento = (sequelize, modelName, tableName, specificFields = {}) => {
    const baseFields = {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: () => uuidv4(),
        },
        nome: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true,
            },
        },
        tipoServico: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        observacao: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("pendente", "confirmado", "cancelado"),
            defaultValue: "pendente",
        },
        motivoCancelamento: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        version: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    }

    const allFields = { ...baseFields, ...specificFields }

    return sequelize.define(modelName, allFields, {
        tableName,
        underscored: true,
    })
}

module.exports = createBaseAgendamento
