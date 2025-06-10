const { format, isAfter, isBefore, startOfDay, addDays, getDay } = require("date-fns")
const { ptBR } = require("date-fns/locale")

const temAlmoco = (agendamento) => {
	return agendamento.turno === "A" || agendamento.turno === "ADM" || agendamento.quantidadeAlmocoLanche > 0
}

const temJantarCeia = (agendamento) => {
	return agendamento.turno === "B" || agendamento.quantidadeJantarCeia > 0
}

const temLanche = (agendamento) => {
	return agendamento.turno === "A" || agendamento.turno === "ADM" || agendamento.quantidadeLancheExtra > 0
}

const validarHorarioCancelamento = (agendamento) => {
	try {
		const agora = new Date()
		const horaAtual = agora.getHours()
		const minutosAtual = agora.getMinutes()
		const diaAtual = startOfDay(agora)

		const obterDataAgendamento = () => {
			const adjustDate = (dateString) => {
				if (!dateString) return null
				const date = new Date(dateString)

				const userTimezoneOffset = date.getTimezoneOffset() * 60000
				const adjustedDate = new Date(date.getTime() + userTimezoneOffset)
				adjustedDate.setHours(0, 0, 0, 0)

				return adjustedDate
			}

			if (agendamento.tipoAgendamento === "Agendamento para Time") {
				if (agendamento.dataFeriado) {
					return adjustDate(agendamento.dataFeriado)
				}
				if (agendamento.dataInicio) {
					return adjustDate(agendamento.dataInicio)
				}
			}
			return null
		}

		const dataAgendamento = obterDataAgendamento()
		if (!dataAgendamento || isNaN(dataAgendamento.getTime())) {
			return {
				permitido: false,
				mensagem: "Data de agendamento inválida.",
			}
		}

		const dataAgendamentoSemHora = startOfDay(dataAgendamento)
		const diaAgendamento = getDay(dataAgendamento)
		const ehFinalDeSemana = diaAgendamento === 0 || diaAgendamento === 6 || agendamento.isFeriado

		if (isBefore(dataAgendamentoSemHora, diaAtual)) {
			return {
				permitido: false,
				mensagem: "Não é possível cancelar agendamentos de datas passadas.",
			}
		}

		if (agendamento.tipoAgendamento === "Agendamento para Time") {
			if (ehFinalDeSemana) {
				const diaAnterior = addDays(dataAgendamentoSemHora, -1)

				if (temAlmoco(agendamento)) {
					if (diaAtual.getTime() === diaAnterior.getTime()) {
						if (horaAtual > 13 || (horaAtual === 13 && minutosAtual > 30)) {
							return {
								permitido: false,
								mensagem: "O horário limite para cancelamento de almoço em fins de semana/feriados é até 13:30h do dia anterior.",
							}
						}
					}
				}

				if (temJantarCeia(agendamento)) {
					if (diaAtual.getTime() === dataAgendamentoSemHora.getTime()) {
						if (horaAtual >= 12) {
							return {
								permitido: false,
								mensagem: "O horário limite para cancelamento de jantar e ceia em fins de semana/feriados é até 12:00h do dia do evento.",
							}
						}
					}
				}
			} else {
				if (diaAtual.getTime() === dataAgendamentoSemHora.getTime()) {
					if (temAlmoco(agendamento)) {
						if (horaAtual > 7 || (horaAtual === 7 && minutosAtual > 35)) {
							return {
								permitido: false,
								mensagem: "O horário limite para cancelamento de almoço é até 07:35h do mesmo dia.",
							}
						}
					}

					if (temJantarCeia(agendamento)) {
						if (horaAtual > 9 || (horaAtual === 9 && minutosAtual > 5)) {
							return {
								permitido: false,
								mensagem: "O horário limite para cancelamento de jantar e ceia é até 09:05h do mesmo dia.",
							}
						}
					}
				}
			}

			return { permitido: true, mensagem: "" }
		}

		return { permitido: true, mensagem: "" }
	} catch (error) {
		console.error("Erro ao validar horário de cancelamento:", error)
		return {
			permitido: false,
			mensagem: "Erro interno ao validar horário de cancelamento.",
		}
	}
}

module.exports = {
	validarHorarioCancelamento,
}
