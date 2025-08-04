const { format, isAfter, isBefore, startOfDay, addDays, getDay } = require("date-fns")
const { ptBR } = require("date-fns/locale")

const temAlmoco = (agendamento) => {
	if (agendamento.tipoAgendamento === "Administrativo - Lanche") {
		return false
	}
	return agendamento.turno === "A" || agendamento.turno === "ADM" || agendamento.quantidadeAlmoco > 0 ||
		(agendamento.tipoAgendamento === "Home Office" && agendamento.refeicoes?.includes("Almoço"))
}

const temJantarCeia = (agendamento) => {
	if (agendamento.tipoAgendamento === "Administrativo - Lanche") {
		return false
	}
	return agendamento.turno === "B" || agendamento.quantidadeJantar > 0 || agendamento.quantidadeCeia > 0 ||
		(agendamento.tipoAgendamento === "Home Office" && (agendamento.refeicoes?.includes("Jantar") || agendamento.refeicoes?.includes("Ceia")))
}

const temLanche = (agendamento) => {
	return agendamento.turno === "A" || agendamento.turno === "ADM" || agendamento.quantidadeLanche > 0
}

const getMensagemCancelamento = (agendamento, ehFinalDeSemana) => {
	if (agendamento.tipoAgendamento === "Coffee Break") {
		return "O cancelamento de Coffee Break deve ser feito até 12:00h do dia anterior."
	}

	if (ehFinalDeSemana) {
		if (agendamento.tipoAgendamento === "Home Office") {
			if (temAlmoco(agendamento)) {
				return "O cancelamento de almoço em Home Office para fins de semana/feriados deve ser feito até 13:30h do dia anterior."
			}
			if (temJantarCeia(agendamento)) {
				return "O cancelamento de jantar/ceia em Home Office para fins de semana/feriados deve ser feito até 12:00h do dia solicitado."
			}
		} else {
			if (temAlmoco(agendamento)) {
				return "O cancelamento de almoço em fins de semana/feriados deve ser feito até 13:30h do dia anterior."
			}
			return "O cancelamento de refeições em fins de semana/feriados deve ser feito até 12:00h do dia solicitado."
		}
	} else {
		if (agendamento.tipoAgendamento === "Home Office") {
			if (temAlmoco(agendamento) && temJantarCeia(agendamento)) {
				return "O cancelamento de almoço deve ser feito até 07:35h e de jantar/ceia até 09:05h do mesmo dia."
			} else if (temAlmoco(agendamento)) {
				return "O cancelamento de almoço deve ser feito até 07:35h do mesmo dia."
			} else if (temJantarCeia(agendamento)) {
				return "O cancelamento de jantar/ceia deve ser feito até 09:05h do mesmo dia."
			}
		} else {
			if (temAlmoco(agendamento)) {
				return "O cancelamento de almoço (Turno A e ADM) em dias úteis deve ser feito até 07:35h do mesmo dia."
			}
			if (temJantarCeia(agendamento)) {
				return "O cancelamento de jantar e ceia (Turno B) em dias úteis deve ser feito até 09:05h do mesmo dia."
			}
		}
	}
	return "Horário limite de cancelamento excedido."
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

			if (agendamento.tipoAgendamento === "Home Office") {
				return adjustDate(agendamento.dataInicio)
			}

			if (agendamento.tipoAgendamento === "Agendamento para Time") {
				if (agendamento.dataFeriado) {
					return adjustDate(agendamento.dataFeriado)
				}
				if (agendamento.dataInicio) {
					return adjustDate(agendamento.dataInicio)
				}
			}

			if (agendamento.tipoAgendamento === "Coffee Break") {
				return adjustDate(agendamento.dataCoffee)
			}

			if (agendamento.tipoAgendamento === "Administrativo - Lanche") {
				return adjustDate(agendamento.data)
			}

			if (agendamento.tipoAgendamento === "Rota Extra") {
				return adjustDate(agendamento.dataInicio)
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

		if (agendamento.tipoAgendamento === "Coffee Break") {
			const diaAnterior = addDays(dataAgendamentoSemHora, -1)
			if (diaAtual.getTime() === diaAnterior.getTime()) {
				if (horaAtual >= 12) {
					return {
						permitido: false,
						mensagem: getMensagemCancelamento(agendamento, ehFinalDeSemana),
					}
				}
			} else if (diaAtual.getTime() === dataAgendamentoSemHora.getTime()) {
				return {
					permitido: false,
					mensagem: getMensagemCancelamento(agendamento, ehFinalDeSemana),
				}
			}
		}

		if (agendamento.tipoAgendamento === "Rota Extra") {
			const diaSemana = agora.getDay()
			if (diaSemana === 5) {
				if (horaAtual >= 11) {
					return {
						permitido: false,
						mensagem: "Rota Extra: Cancelamento deve ser feito até sexta-feira às 11:00h.",
					}
				}
			} else if (diaSemana > 5) {
				return {
					permitido: false,
					mensagem: "Rota Extra: Cancelamento deve ser feito até sexta-feira às 11:00h.",
				}
			}
		}

		if (agendamento.tipoAgendamento === "Administrativo - Lanche") {
			if (diaAtual.getTime() === dataAgendamentoSemHora.getTime()) {
				if (horaAtual >= 9) {
					return {
						permitido: false,
						mensagem: "Lanche das 16h do dia solicitado: Cancelamento deve ser feito até 09:00h do mesmo dia.",
					}
				}
			}
		}

		if (agendamento.tipoAgendamento === "Administrativo - Lanche" && ehFinalDeSemana) {
			if (diaAtual.getTime() === dataAgendamentoSemHora.getTime()) {
				if (horaAtual >= 9) {
					return {
						permitido: false,
						mensagem: "Lanche das 16h do dia solicitado: Cancelamento deve ser feito até 09:00h do mesmo dia.",
					}
				}
			}
		}

		if (ehFinalDeSemana) {
			const diaAnterior = addDays(dataAgendamentoSemHora, -1)

			if (temAlmoco(agendamento)) {
				if (diaAtual.getTime() === diaAnterior.getTime()) {
					if (horaAtual > 13 || (horaAtual === 13 && minutosAtual > 30)) {
						return {
							permitido: false,
							mensagem: getMensagemCancelamento(agendamento, true),
						}
					}
				} else if (diaAtual.getTime() === dataAgendamentoSemHora.getTime()) {
					return {
						permitido: false,
						mensagem: getMensagemCancelamento(agendamento, true),
					}
				}
			}

			if (temJantarCeia(agendamento)) {
				if (diaAtual.getTime() === dataAgendamentoSemHora.getTime()) {
					if (horaAtual >= 12) {
						return {
							permitido: false,
							mensagem: getMensagemCancelamento(agendamento, true),
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
							mensagem: getMensagemCancelamento(agendamento, false),
						}
					}
				}

				if (temJantarCeia(agendamento)) {
					if (horaAtual > 9 || (horaAtual === 9 && minutosAtual > 5)) {
						return {
							permitido: false,
							mensagem: getMensagemCancelamento(agendamento, false),
						}
					}
				}
			}
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
