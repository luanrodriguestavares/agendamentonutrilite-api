const AgendamentoTime = require("../models/AgendamentoTime")
const HomeOffice = require("../models/HomeOffice")
const SolicitacaoLanche = require("../models/SolicitacaoLanche")
const AgendamentoVisitante = require("../models/AgendamentoVisitante")
const CoffeeBreak = require("../models/CoffeeBreak")
const RotaExtra = require("../models/RotaExtra")
const { sendEmail } = require("../utils/email")
const { validarHorarioCancelamento } = require("../utils/agendamentoUtils")
const sequelize = require("../config/database")
const XLSX = require("xlsx")
const { isAfter, startOfDay, format } = require("date-fns")
const { ptBR } = require("date-fns/locale")

class AgendamentoController {
    static getModelByType(tipoAgendamento) {
        const models = {
            "Agendamento para Time": AgendamentoTime,
            "Home Office": HomeOffice,
            "Administrativo - Lanche": SolicitacaoLanche,
            "Agendamento para Visitante": AgendamentoVisitante,
            "Coffee Break": CoffeeBreak,
            "Rota Extra": RotaExtra,
        }
        return models[tipoAgendamento]
    }

    async create(req, res) {
        try {
            const { tipoAgendamento, ...dadosAgendamento } = req.body

            const Model = AgendamentoController.getModelByType(tipoAgendamento)
            if (!Model) {
                return res.status(400).json({ error: "Tipo de agendamento inválido" })
            }

            const dadosMapeados = this.mapearDadosParaBanco(tipoAgendamento, dadosAgendamento)

            const agendamento = await Model.create(dadosMapeados)

            if (process.env.ENABLE_EMAILS === "true") {
                await this.enviarEmailsConfirmacao(agendamento, tipoAgendamento)
            }

            return res.status(201).json({
                ...agendamento.toJSON(),
                tipoAgendamento,
            })
        } catch (error) {
            console.error("Erro ao criar agendamento:", error)
            return res.status(500).json({ error: "Erro ao criar agendamento" })
        }
    }

    mapearDadosParaBanco(tipoAgendamento, dados) {
        const tratarData = (dataString) => {
            if (!dataString) return null
            return dataString.split("T")[0]
        }

        const dadosBase = {
            nome: dados.nome,
            email: dados.email,
            tipoServico: dados.tipoServico,
            observacao: dados.observacao,
        }

        switch (tipoAgendamento) {
            case "Agendamento para Time":
                return {
                    ...dadosBase,
                    timeSetor: dados.timeSetor,
                    centroCusto: dados.centroCusto,
                    isFeriado: dados.isFeriado || false,
                    dataInicio: tratarData(dados.dataInicio),
                    dataFim: tratarData(dados.dataFim),
                    dataFeriado: tratarData(dados.dataFeriado),
                    turno: dados.turno,
                    quantidadeAlmoco: dados.quantidadeAlmoco,
                    quantidadeLanche: dados.quantidadeLanche,
                    quantidadeJantar: dados.quantidadeJantar,
                    quantidadeCeia: dados.quantidadeCeia,
                    refeitorio: dados.refeitorio,
                    diasSemana: dados.diasSemana,
                    observacao: dados.observacao,
                }

            case "Home Office":
                return {
                    ...dadosBase,
                    timeSetor: dados.timeSetor,
                    dataInicio: tratarData(dados.dataInicio),
                    dataFim: tratarData(dados.dataFim),
                    turno: dados.turno,
                    refeitorio: dados.refeitorio,
                    refeicoes: dados.refeicoes,
                    diasSemana: dados.diasSemana,
                }

            case "Administrativo - Lanche":
                return {
                    ...dadosBase,
                    timeSetor: dados.timeSetor,
                    data: tratarData(dados.data),
                    turno: dados.turno,
                    refeitorio: dados.refeitorio,
                    refeicoes: dados.refeicoes || "Lanche Individual",
                }

            case "Agendamento para Visitante":
                return {
                    ...dadosBase,
                    data: tratarData(dados.data),
                    refeitorio: dados.refeitorio,
                    quantidadeVisitantes: dados.quantidadeVisitantes,
                    acompanhante: dados.acompanhante,
                    centroCusto: dados.centroCusto,
                    rateio: dados.rateio,
                }

            case "Coffee Break":
                return {
                    ...dadosBase,
                    timeSetor: dados.timeSetor,
                    turno: dados.turno,
                    cardapio: dados.cardapio,
                    quantidade: dados.quantidade,
                    centroCusto: dados.centroCusto,
                    rateio: dados.rateio,
                    dataCoffee: tratarData(dados.dataCoffee),
                    horario: dados.horario,
                    localEntrega: dados.localEntrega,
                }

            case "Rota Extra":
                return {
                    ...dadosBase,
                    timeSetor: dados.timeSetor,
                    centroCusto: dados.centroCusto,
                    dia: dados.dia,
                    dataInicio: tratarData(dados.dataInicio),
                    dataFim: tratarData(dados.dataFim),
                    quantidadeTiangua: dados.quantidadeTiangua,
                    quantidadeUbajara: dados.quantidadeUbajara,
                    diasSemana: dados.diasSemana,
                }

            default:
                return dadosBase
        }
    }

    async enviarEmailsConfirmacao(agendamento, tipoAgendamento) {
        const agendamentoComTipo = {
            ...agendamento.toJSON(),
            tipoAgendamento,
        }

        await sendEmail({
            to: agendamento.email,
            subject: "Confirmação de Agendamento",
            text: `Olá ${agendamento.nome},\n\nSeu agendamento foi recebido com sucesso!\n\nDetalhes do agendamento:\nTipo: ${tipoAgendamento}\nStatus: Pendente\n\nEm breve você receberá uma confirmação.\n\nAtenciosamente,\nEquipe Nutrilite`,
            agendamento: agendamentoComTipo,
        })

        await sendEmail({
            to: process.env.EMAIL_FROM,
            subject: "Novo Agendamento Recebido",
            text: `Novo agendamento recebido:\n\nNome do Solicitante: ${agendamento.nome}\nEmail: ${agendamento.email}\nTipo: ${tipoAgendamento}\n\nAcesse o painel para mais detalhes.`,
            agendamento: agendamentoComTipo,
        })
    }

    async list(req, res) {
        try {
            const tipos = [
                "Agendamento para Time",
                "Home Office",
                "Administrativo - Lanche",
                "Agendamento para Visitante",
                "Coffee Break",
                "Rota Extra",
            ]

            const todosAgendamentos = []

            for (const tipo of tipos) {
                const Model = AgendamentoController.getModelByType(tipo)
                const agendamentos = await Model.findAll({
                    order: [["createdAt", "DESC"]],
                })

                const agendamentosComTipo = agendamentos.map((ag) => ({
                    ...ag.toJSON(),
                    tipoAgendamento: tipo,
                }))

                todosAgendamentos.push(...agendamentosComTipo)
            }

            todosAgendamentos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

            return res.json(todosAgendamentos)
        } catch (error) {
            console.error("Erro ao listar agendamentos:", error)
            return res.status(500).json({ error: "Erro ao listar agendamentos" })
        }
    }

    async show(req, res) {
        try {
            const { id } = req.params
            const tipos = [
                "Agendamento para Time",
                "Home Office",
                "Administrativo - Lanche",
                "Agendamento para Visitante",
                "Coffee Break",
                "Rota Extra",
            ]

            for (const tipo of tipos) {
                const Model = AgendamentoController.getModelByType(tipo)
                const agendamento = await Model.findByPk(id)

                if (agendamento) {
                    return res.json({
                        ...agendamento.toJSON(),
                        tipoAgendamento: tipo,
                    })
                }
            }

            return res.status(404).json({ error: "Agendamento não encontrado" })
        } catch (error) {
            console.error("Erro ao buscar agendamento:", error)
            return res.status(500).json({ error: "Erro ao buscar agendamento" })
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params
            const { tipoAgendamento, ...dadosAgendamento } = req.body

            const Model = AgendamentoController.getModelByType(tipoAgendamento)
            if (!Model) {
                return res.status(400).json({ error: "Tipo de agendamento inválido" })
            }

            const agendamento = await Model.findByPk(id)
            if (!agendamento) {
                return res.status(404).json({ error: "Agendamento não encontrado" })
            }

            if (Object.keys(dadosAgendamento).length === 1 && dadosAgendamento.status) {
                await agendamento.update({ status: dadosAgendamento.status })
            } else {
                const dadosMapeados = this.mapearDadosParaBanco(tipoAgendamento, dadosAgendamento)
                await agendamento.update(dadosMapeados)
            }

            if (process.env.ENABLE_EMAILS === "true" && dadosAgendamento.status === "confirmado") {
                const agendamentoComTipo = {
                    ...agendamento.toJSON(),
                    tipoAgendamento,
                }

                sendEmail({
                    to: agendamento.email,
                    subject: "Agendamento Confirmado",
                    text: `Olá ${agendamento.nome},\n\nSeu agendamento foi confirmado!\n\nDetalhes do agendamento:\nTipo: ${tipoAgendamento}\nStatus: Confirmado\n\nAtenciosamente,\nEquipe Nutrilite`,
                    agendamento: agendamentoComTipo,
                }).catch(error => {
                    console.error('Erro ao enviar email de confirmação:', error)
                })
            }

            return res.json({
                ...agendamento.toJSON(),
                tipoAgendamento,
            })
        } catch (error) {
            console.error("Erro ao atualizar agendamento:", error)
            return res.status(500).json({ error: "Erro ao atualizar agendamento" })
        }
    }

    async cancel(req, res) {
        const transaction = await sequelize.transaction()
        try {
            const { id } = req.params
            const { tipo, motivo, origem } = req.body

            const Model = AgendamentoController.getModelByType(tipo)
            if (!Model) {
                await transaction.rollback()
                return res.status(400).json({ error: "Tipo de agendamento inválido" })
            }

            const agendamento = await Model.findByPk(id)
            if (!agendamento) {
                await transaction.rollback()
                return res.status(404).json({ error: "Agendamento não encontrado" })
            }

            if (agendamento.status === "cancelado") {
                await transaction.rollback()
                return res.status(400).json({ error: "Agendamento já está cancelado" })
            }

            const agendamentoComTipo = {
                ...agendamento.toJSON(),
                tipoAgendamento: tipo,
            }

            const validacao = validarHorarioCancelamento(agendamentoComTipo)
            if (!validacao.permitido) {
                await transaction.rollback()
                return res.status(400).json({
                    error: "Não é possível cancelar o agendamento neste horário",
                    code: "INVALID_TIME",
                    details: validacao.mensagem,
                    origem: origem || "sistema"
                })
            }

            await agendamento.update(
                {
                    status: "cancelado",
                    motivoCancelamento: motivo || null,
                    version: agendamento.version + 1,
                },
                { transaction },
            )

            if (process.env.ENABLE_EMAILS === "true") {
                const agendamentoComTipo = {
                    ...agendamento.toJSON(),
                    tipoAgendamento: tipo,
                }

                await sendEmail({
                    to: agendamento.email,
                    subject: "Agendamento Cancelado",
                    text: `Olá ${agendamento.nome},\n\nSeu agendamento foi cancelado${motivo ? ` pelo seguinte motivo: ${motivo}` : ""}.\n\nAtenciosamente,\nEquipe Nutrilite`,
                    agendamento: agendamentoComTipo,
                    motivo,
                    error: validacao.mensagem
                })
            }

            await transaction.commit()
            return res.json({
                message: "Agendamento cancelado com sucesso",
                data: {
                    ...agendamento.toJSON(),
                    tipoAgendamento: tipo,
                }
            })
        } catch (error) {
            await transaction.rollback()
            console.error("Erro ao cancelar agendamento:", error)
            return res.status(500).json({ error: "Erro ao cancelar agendamento" })
        }
    }

    async exportXLSX(req, res) {
        try {
            console.log("Iniciando exportação de agendamentos...")

            const tipos = [
                "Agendamento para Time",
                "Home Office",
                "Administrativo - Lanche",
                "Agendamento para Visitante",
                "Coffee Break",
                "Rota Extra",
            ]

            const todosAgendamentos = []

            for (const tipo of tipos) {
                const Model = AgendamentoController.getModelByType(tipo)
                const agendamentos = await Model.findAll({
                    order: [["createdAt", "DESC"]],
                })

                const agendamentosComTipo = agendamentos.map((ag) => ({
                    ...ag.toJSON(),
                    tipoAgendamento: tipo,
                }))

                todosAgendamentos.push(...agendamentosComTipo)
            }

            console.log(`Total de agendamentos encontrados: ${todosAgendamentos.length}`)

            if (todosAgendamentos.length === 0) {
                return res.status(404).json({ error: "Nenhum agendamento encontrado" })
            }

            const wb = XLSX.utils.book_new()

            const formatarData = (data) => {
                if (!data) return ""
                try {
                    const date = new Date(data)
                    return isNaN(date.getTime()) ? "" : format(date, "dd/MM/yyyy")
                } catch (error) {
                    return ""
                }
            }

            const dadosFormatados = todosAgendamentos.map((ag) => ({
                Nome: ag.nome || "",
                Email: ag.email || "",
                Status: ag.status || "",
                "Tipo de Agendamento": ag.tipoAgendamento || "",
                "Time/Setor": ag.timeSetor || "",
                "Centro de Custo": ag.centroCusto || "",
                "Data de Criação": formatarData(ag.createdAt),
                "Cancelado Por": ag.canceladoPor || "",
                "Motivo do Cancelamento": ag.motivoCancelamento || "",
                Observação: ag.observacao || "",
            }))

            const wsAll = XLSX.utils.json_to_sheet(dadosFormatados)
            XLSX.utils.book_append_sheet(wb, wsAll, "Todos os Agendamentos")

            tipos.forEach((tipo) => {
                const filtrados = dadosFormatados.filter((ag) => ag["Tipo de Agendamento"] === tipo)
                if (filtrados.length > 0) {
                    const ws = XLSX.utils.json_to_sheet(filtrados)
                    const nomeAba = tipo.replace(/[^\w\s]/gi, "").substring(0, 31)
                    XLSX.utils.book_append_sheet(wb, ws, nomeAba)
                }
            })

            const buf = XLSX.write(wb, {
                type: "buffer",
                bookType: "xlsx",
            })

            res.setHeader("Content-Disposition", "attachment; filename=agendamentos.xlsx")
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
            res.setHeader("Content-Length", buf.length)

            res.send(buf)
        } catch (error) {
            console.error("Erro ao exportar agendamentos:", error)
            return res.status(500).json({
                error: "Erro ao exportar agendamentos",
                details: error.message,
            })
        }
    }
}

module.exports = new AgendamentoController()
