const { format, isAfter, isBefore, startOfDay, addDays, getDay } = require("date-fns")
const { ptBR } = require("date-fns/locale")

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

			switch (agendamento.tipoAgendamento) {
				case "Agendamento para Time":
					if (agendamento.dataFeriado) {
						return adjustDate(agendamento.dataFeriado)
					}
					if (agendamento.dataInicio) {
						return adjustDate(agendamento.dataInicio)
					}
					break
				case "Home Office":
					if (agendamento.dataInicio) {
						return adjustDate(agendamento.dataInicio)
					}
					break
				case "Administrativo - Lanche":
					if (agendamento.data) {
						return adjustDate(agendamento.data)
					}
					break
				case "Agendamento para Visitante":
					if (agendamento.data) {
						return adjustDate(agendamento.data)
					}
					break
				case "Coffee Break":
					if (agendamento.dataCoffee) {
						return adjustDate(agendamento.dataCoffee)
					}
					break
				case "Rota Extra":
					if (agendamento.dataInicio) {
						return adjustDate(agendamento.dataInicio)
					}
					break
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
		const ehFinalDeSemana = diaAgendamento === 0 || diaAgendamento === 6

		if (isBefore(dataAgendamentoSemHora, diaAtual)) {
			return {
				permitido: false,
				mensagem: "Não é possível cancelar agendamentos de datas passadas.",
			}
		}

		if (agendamento.tipoAgendamento === "Coffee Break") {
			const diaAnterior = addDays(dataAgendamentoSemHora, -1)

			if (diaAtual.getTime() === dataAgendamentoSemHora.getTime()) {
				return {
					permitido: false,
					mensagem: "Coffee Break deve ser cancelado até às 12:00h do dia anterior.",
				}
			}

			if (diaAtual.getTime() === diaAnterior.getTime()) {
				if (horaAtual >= 12) {
					return {
						permitido: false,
						mensagem: "O horário limite para cancelamento de Coffee Break é até às 12:00h do dia anterior.",
					}
				}
			}

			return { permitido: true, mensagem: "" }
		}

		if (agendamento.tipoAgendamento === "Rota Extra") {
			const diaAtualSemana = getDay(agora)
			const dataAgendamentoSemana = getDay(dataAgendamento)
			const ehFimDeSemanaAtual =
				dataAgendamentoSemana >= 6 && // Sábado ou Domingo
				Math.abs(dataAgendamento - agora) <= 7 * 24 * 60 * 60 * 1000 // Dentro de 7 dias

			if (ehFimDeSemanaAtual) {
				if (diaAtualSemana === 5) {
					if (horaAtual >= 11) {
						return {
							permitido: false,
							mensagem: "O horário limite para cancelamento de Rota Extra é até às 11:00h da sexta-feira.",
						}
					}
				} else if (diaAtualSemana === 6 || diaAtualSemana === 0) {
					return {
						permitido: false,
						mensagem:
							"Não é possível cancelar Rota Extra nos finais de semana. O prazo limite é até às 11:00h da sexta-feira.",
					}
				}
			}

			return { permitido: true, mensagem: "" }
		}

		if (agendamento.tipoAgendamento === "Administrativo - Lanche") {
			if (diaAtual.getTime() === dataAgendamentoSemHora.getTime()) {
				if (horaAtual > 7 || (horaAtual === 7 && minutosAtual > 35)) {
					return {
						permitido: false,
						mensagem: "O horário limite para cancelamento de lanche individual é até 07:35h do dia solicitado.",
					}
				}
			}
			return { permitido: true, mensagem: "" }
		}

		if (agendamento.tipoAgendamento === "Agendamento para Visitante") {
			if (diaAtual.getTime() === dataAgendamentoSemHora.getTime()) {
				if (horaAtual > 7 || (horaAtual === 7 && minutosAtual > 30)) {
					return {
						permitido: false,
						mensagem: "O horário limite para cancelamento de agendamento para visitante é até 07:30h do dia solicitado.",
					}
				}
			}
			return { permitido: true, mensagem: "" }
		}

		const temRefeicoes =
			agendamento.refeicoes ||
			agendamento.quantidadeAlmocoLanche ||
			agendamento.quantidadeJantarCeia ||
			agendamento.quantidadeLancheExtra

		if (temRefeicoes) {
			if (ehFinalDeSemana) {
				return validarCancelamentoFinalDeSemana(
					agendamento,
					agora,
					diaAtual,
					dataAgendamentoSemHora,
					horaAtual,
					minutosAtual,
				)
			}

			return validarCancelamentoDiaUtil(agendamento, agora, diaAtual, dataAgendamentoSemHora, horaAtual, minutosAtual)
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

const validarCancelamentoFinalDeSemana = (
	agendamento,
	agora,
	diaAtual,
	dataAgendamentoSemHora,
	horaAtual,
	minutosAtual,
) => {
	const diaAnterior = addDays(dataAgendamentoSemHora, -1)

	if (diaAtual.getTime() === diaAnterior.getTime()) {
		if (temAlmoco(agendamento)) {
			if (horaAtual > 13 || (horaAtual === 13 && minutosAtual > 30)) {
				return {
					permitido: false,
					mensagem: "O horário limite para cancelamento de almoço do final de semana é até 13:30h do dia anterior.",
				}
			}
		}
		return { permitido: true, mensagem: "" }
	}

	if (diaAtual.getTime() === dataAgendamentoSemHora.getTime()) {
		if (temLanche(agendamento) || temJantarCeia(agendamento)) {
			if (horaAtual >= 12) {
				return {
					permitido: false,
					mensagem:
						"O horário limite para cancelamento de lanche das 16h, jantar e ceia no final de semana é até 12:00h do dia solicitado.",
				}
			}
		}
		return { permitido: true, mensagem: "" }
	}

	return { permitido: true, mensagem: "" }
}

const validarCancelamentoDiaUtil = (agendamento, agora, diaAtual, dataAgendamentoSemHora, horaAtual, minutosAtual) => {
	const amanha = addDays(diaAtual, 1)

	if (diaAtual.getTime() === dataAgendamentoSemHora.getTime()) {
		if (temAlmoco(agendamento)) {
			if (horaAtual > 7 || (horaAtual === 7 && minutosAtual > 35)) {
				return {
					permitido: false,
					mensagem: "O horário limite para cancelamento de almoço é até 07:35h do dia solicitado.",
				}
			}
		}

		if (temJantarCeia(agendamento)) {
			if (horaAtual > 9 || (horaAtual === 9 && minutosAtual > 5)) {
				return {
					permitido: false,
					mensagem: "O horário limite para cancelamento de jantar e ceia é até 09:05h do dia solicitado.",
				}
			}
		}

		if (temLanche(agendamento)) {
			if (horaAtual > 9 || (horaAtual === 9 && minutosAtual > 5)) {
				return {
					permitido: false,
					mensagem: "O horário limite para cancelamento de lanche das 16h é até 09:05h do dia solicitado.",
				}
			}
		}

		return { permitido: true, mensagem: "" }
	}

	if (dataAgendamentoSemHora.getTime() === amanha.getTime()) {
		return { permitido: true, mensagem: "" }
	}

	return { permitido: true, mensagem: "" }
}

const temAlmoco = (agendamento) => {
	if (agendamento.quantidadeAlmocoLanche && agendamento.quantidadeAlmocoLanche > 0) {
		return true
	}

	if (agendamento.refeicoes) {
		if (Array.isArray(agendamento.refeicoes)) {
			return agendamento.refeicoes.includes("Almoço")
		}
		if (typeof agendamento.refeicoes === "string") {
			try {
				const refeicoes = JSON.parse(agendamento.refeicoes)
				return refeicoes.includes("Almoço")
			} catch {
				return agendamento.refeicoes.toLowerCase().includes("almoço")
			}
		}
	}

	return false
}

const temJantarCeia = (agendamento) => {
	if (agendamento.quantidadeJantarCeia && agendamento.quantidadeJantarCeia > 0) {
		return true
	}

	if (agendamento.refeicoes) {
		if (Array.isArray(agendamento.refeicoes)) {
			return agendamento.refeicoes.includes("Jantar") || agendamento.refeicoes.includes("Ceia")
		}
		if (typeof agendamento.refeicoes === "string") {
			try {
				const refeicoes = JSON.parse(agendamento.refeicoes)
				return refeicoes.includes("Jantar") || refeicoes.includes("Ceia")
			} catch {
				const refeicaoLower = agendamento.refeicoes.toLowerCase()
				return refeicaoLower.includes("jantar") || refeicaoLower.includes("ceia")
			}
		}
	}

	return false
}

const temLanche = (agendamento) => {
	if (agendamento.quantidadeLancheExtra && agendamento.quantidadeLancheExtra > 0) {
		return true
	}

	if (agendamento.tipoAgendamento === "Administrativo - Lanche") {
		return true
	}

	if (agendamento.refeicoes) {
		if (Array.isArray(agendamento.refeicoes)) {
			return agendamento.refeicoes.includes("Lanche") || agendamento.refeicoes.includes("Lanche das 16h")
		}
		if (typeof agendamento.refeicoes === "string") {
			try {
				const refeicoes = JSON.parse(agendamento.refeicoes)
				return refeicoes.includes("Lanche") || refeicoes.includes("Lanche das 16h")
			} catch {
				const refeicaoLower = agendamento.refeicoes.toLowerCase()
				return refeicaoLower.includes("lanche")
			}
		}
	}

	return false
}

module.exports = {
	validarHorarioCancelamento,
}
