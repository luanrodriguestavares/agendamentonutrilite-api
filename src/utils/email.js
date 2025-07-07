const nodemailer = require('nodemailer');
require('dotenv').config();

const formatarData = (data) => {
    if (!data) return 'Data não informada';
    try {
        const date = new Date(data);
        if (isNaN(date.getTime())) return 'Data inválida';

        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
        adjustedDate.setHours(0, 0, 0, 0);

        return adjustedDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (error) {
        return 'Data inválida';
    }
};

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
});

const gerarLinkCancelamento = (agendamentoId) => {
    return `${process.env.FRONTEND_URL}/cancelar-agendamento/${agendamentoId}`;
};

const gerarTemplateEmail = (nome, tipo, status, linkCancelamento, agendamento) => {
    const getDetalhesAgendamento = () => {
        switch (tipo) {
            case 'Agendamento para Time':
                return `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Time/Setor:</strong> ${agendamento.timeSetor || 'Não informado'}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Data:</strong> ${formatarData(agendamento.dataFeriado || agendamento.dataInicio)}
                        </td>
                    </tr>
                    ${agendamento.turno ? `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Turno:</strong> ${agendamento.turno}
                        </td>
                    </tr>
                    ` : ''}
                `;
            case 'Home Office':
                return `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Data Início:</strong> ${formatarData(agendamento.dataInicio)}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Data Fim:</strong> ${formatarData(agendamento.dataFim)}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Refeitório:</strong> ${agendamento.refeitorio || 'Não informado'}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Turno:</strong> ${agendamento.turno || 'Não informado'}
                        </td>
                    </tr>
                `;
            case 'Administrativo - Lanche':
                return `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Data:</strong> ${formatarData(agendamento.data)}
                        </td>
                    </tr>
                    ${agendamento.refeicoes !== "Lanche Individual" ? `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Quantidade:</strong> ${agendamento.qtdLanche || '0'}
                        </td>
                    </tr>
                    ` : ''}
                `;
            case 'Agendamento para Visitante':
                return `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Data da Visita:</strong> ${formatarData(agendamento.data)}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Refeitório:</strong> ${agendamento.refeitorio || 'Não informado'}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Quantidade de Visitantes:</strong> ${agendamento.quantidadeVisitantes || '0'}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Acompanhante:</strong> ${agendamento.acompanhante || 'Não informado'}
                        </td>
                    </tr>
                `;
            case 'Coffee Break':
                return `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Time/Setor:</strong> ${agendamento.timeSetor || 'Não informado'}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Data:</strong> ${formatarData(agendamento.dataCoffee)}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Horário:</strong> ${agendamento.horario || 'Não informado'}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Cardápio:</strong> ${agendamento.cardapio || 'Não informado'}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Quantidade:</strong> ${agendamento.quantidade || '0'} pessoas
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Centro de Custo:</strong> ${agendamento.centroCusto || 'Não informado'}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Rateio:</strong> ${agendamento.rateio || 'Não informado'}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Local de Entrega:</strong> ${agendamento.localEntrega || 'Não informado'}
                        </td>
                    </tr>
                `;
            default:
                return '';
        }
    };

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="background-color: #059669; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Confirmação de Agendamento</h1>
            </div>

            <div style="padding: 30px;">
                <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 20px;">
                    Prezado(a) <strong>${nome}</strong>,
                </p>

                <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 20px;">
                    ${status === 'pendente' ?
            'Recebemos seu agendamento com sucesso! Em breve você receberá uma confirmação.' :
            'Seu agendamento foi confirmado!'}
                </p>

                <div style="background-color: #f9fafb; border-radius: 6px; padding: 20px; margin: 20px 0;">
                    <h2 style="color: #059669; font-size: 18px; margin-top: 0; margin-bottom: 15px;">Detalhes do Agendamento</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">
                                <strong>Tipo:</strong> ${tipo}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">
                                <strong>Status:</strong> ${status === 'pendente' ? 'Pendente' : 'Confirmado'}
                            </td>
                        </tr>
                        ${getDetalhesAgendamento()}
                    </table>
                </div>

                ${status === 'pendente' ? `
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${linkCancelamento}"
                           style="background-color: #dc2626;
                                  color: white;
                                  padding: 12px 24px;
                                  text-decoration: none;
                                  border-radius: 6px;
                                  display: inline-block;
                                  font-weight: 500;">
                            Cancelar Agendamento
                        </a>
                    </div>
                ` : ''}

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="font-size: 14px; color: #6b7280; margin: 0;">
                        Este é um e-mail automático. Por favor, não responda.
                    </p>
                    <p style="font-size: 14px; color: #6b7280; margin: 10px 0 0 0;">
                        Em caso de dúvidas, entre em contato com a equipe Nutrilite.
                    </p>
                </div>
            </div>
        </div>
    `;
};

const gerarTemplateCancelamento = (nome, tipo, motivo, agendamento) => {
    const getDetalhesAgendamento = () => {
        switch (tipo) {
            case 'Agendamento para Time':
                return `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Time/Setor:</strong> ${agendamento.timeSetor || 'Não informado'}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Data:</strong> ${formatarData(agendamento.dataFeriado || agendamento.dataInicio)}
                        </td>
                    </tr>
                    ${agendamento.turno ? `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Turno:</strong> ${agendamento.turno}
                        </td>
                    </tr>
                    ` : ''}
                `;
            case 'Home Office':
                return `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Data Início:</strong> ${formatarData(agendamento.dataInicio)}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Data Fim:</strong> ${formatarData(agendamento.dataFim)}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Refeitório:</strong> ${agendamento.refeitorio || 'Não informado'}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Turno:</strong> ${agendamento.turno || 'Não informado'}
                        </td>
                    </tr>
                `;
            case 'Administrativo - Lanche':
                return `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Data:</strong> ${formatarData(agendamento.data)}
                        </td>
                    </tr>
                    ${agendamento.refeicoes !== "Lanche Individual" ? `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Quantidade:</strong> ${agendamento.qtdLanche || '0'}
                        </td>
                    </tr>
                    ` : ''}
                `;
            case 'Agendamento para Visitante':
                return `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Data da Visita:</strong> ${formatarData(agendamento.data)}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Refeitório:</strong> ${agendamento.refeitorio || 'Não informado'}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Quantidade de Visitantes:</strong> ${agendamento.quantidadeVisitantes || '0'}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Acompanhante:</strong> ${agendamento.acompanhante || 'Não informado'}
                        </td>
                    </tr>
                `;
            case 'Coffee Break':
                return `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Time/Setor:</strong> ${agendamento.timeSetor || 'Não informado'}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Data:</strong> ${formatarData(agendamento.dataCoffee)}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Horário:</strong> ${agendamento.horario || 'Não informado'}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Cardápio:</strong> ${agendamento.cardapio || 'Não informado'}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Quantidade:</strong> ${agendamento.quantidade || '0'} pessoas
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Centro de Custo:</strong> ${agendamento.centroCusto || 'Não informado'}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Rateio:</strong> ${agendamento.rateio || 'Não informado'}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Local de Entrega:</strong> ${agendamento.localEntrega || 'Não informado'}
                        </td>
                    </tr>
                `;
            default:
                return '';
        }
    };

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="background-color: #059669; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Agendamento Cancelado</h1>
            </div>

            <div style="padding: 30px;">
                <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 20px;">
                    Prezado(a) <strong>${nome}</strong>,
                </p>

                <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 20px;">
                    Informamos que seu agendamento foi cancelado.
                </p>

                ${motivo ? `
                    <div style="background-color: #fee2e2; border-radius: 6px; padding: 15px; margin: 20px 0;">
                        <p style="color: #991b1b; margin: 0;">
                            <strong>Motivo do Cancelamento:</strong><br>
                            ${motivo}
                        </p>
                    </div>
                ` : ''}

                <div style="background-color: #f9fafb; border-radius: 6px; padding: 20px; margin: 20px 0;">
                    <h2 style="color: #dc2626; font-size: 18px; margin-top: 0; margin-bottom: 15px;">Detalhes do Agendamento Cancelado</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">
                                <strong>Tipo:</strong> ${tipo}
                            </td>
                        </tr>
                        ${getDetalhesAgendamento()}
                    </table>
                </div>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="font-size: 14px; color: #6b7280; margin: 0;">
                        Este é um e-mail automático. Por favor, não responda.
                    </p>
                    <p style="font-size: 14px; color: #6b7280; margin: 10px 0 0 0;">
                        Em caso de dúvidas, entre em contato com a equipe Nutrilite.
                    </p>
                </div>
            </div>
        </div>
    `;
};

const gerarTemplateEmailAdmin = (agendamento) => {
    const getDetalhesAgendamento = () => {
        switch (agendamento.tipoAgendamento) {
            case 'Agendamento para Time':
                return `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Time/Setor:</strong> ${agendamento.timeSetor || 'Não informado'}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Data:</strong> ${formatarData(agendamento.dataFeriado || agendamento.dataInicio)}
                        </td>
                    </tr>
                    ${agendamento.turno ? `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Turno:</strong> ${agendamento.turno}
                        </td>
                    </tr>
                    ` : ''}
                `;
            case 'Home Office':
                return `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Data Início:</strong> ${formatarData(agendamento.dataInicio)}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Data Fim:</strong> ${formatarData(agendamento.dataFim)}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Refeitório:</strong> ${agendamento.refeitorio || 'Não informado'}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Turno:</strong> ${agendamento.turno || 'Não informado'}
                        </td>
                    </tr>
                `;
            case 'Administrativo - Lanche':
                return `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Data:</strong> ${formatarData(agendamento.data)}
                        </td>
                    </tr>
                    ${agendamento.refeicoes !== "Lanche Individual" ? `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Quantidade:</strong> ${agendamento.qtdLanche || '0'}
                        </td>
                    </tr>
                    ` : ''}
                `;
            case 'Agendamento para Visitante':
                return `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Data da Visita:</strong> ${formatarData(agendamento.data)}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Refeitório:</strong> ${agendamento.refeitorio || 'Não informado'}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Quantidade de Visitantes:</strong> ${agendamento.quantidadeVisitantes || '0'}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Acompanhante:</strong> ${agendamento.acompanhante || 'Não informado'}
                        </td>
                    </tr>
                `;
            case 'Coffee Break':
                return `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Time/Setor:</strong> ${agendamento.timeSetor || 'Não informado'}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Data:</strong> ${formatarData(agendamento.dataCoffee)}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Horário:</strong> ${agendamento.horario || 'Não informado'}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Cardápio:</strong> ${agendamento.cardapio || 'Não informado'}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Quantidade:</strong> ${agendamento.quantidade || '0'} pessoas
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Centro de Custo:</strong> ${agendamento.centroCusto || 'Não informado'}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Rateio:</strong> ${agendamento.rateio || 'Não informado'}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>Local de Entrega:</strong> ${agendamento.localEntrega || 'Não informado'}
                        </td>
                    </tr>
                `;
            default:
                return '';
        }
    };

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="background-color: #059669; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Novo Agendamento Registrado</h1>
            </div>

            <div style="padding: 30px;">
                <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 20px;">
                    Um novo agendamento foi registrado no sistema.
                </p>

                <div style="background-color: #f9fafb; border-radius: 6px; padding: 20px; margin: 20px 0;">
                    <h2 style="color: #059669; font-size: 18px; margin-top: 0; margin-bottom: 15px;">Detalhes do Agendamento</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">
                                <strong>Solicitante:</strong> ${agendamento.nome}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">
                                <strong>Email:</strong> ${agendamento.email}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">
                                <strong>Tipo:</strong> ${agendamento.tipoAgendamento}
                            </td>
                        </tr>
                        ${getDetalhesAgendamento()}
                    </table>
                </div>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="font-size: 14px; color: #6b7280; margin: 0;">
                        Este é um e-mail automático. Por favor, não responda.
                    </p>
                    <p style="font-size: 14px; color: #6b7280; margin: 10px 0 0 0;">
                        Acesse o painel administrativo para mais detalhes.
                    </p>
                </div>
            </div>
        </div>
    `;
};

const sendEmail = async ({ to, subject, text, html, agendamento, motivo, error }) => {
    try {
        let emailHtml;

        if (subject.includes('Cancelado')) {
            if (error) {
                emailHtml = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <div style="background-color: #dc2626; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Não Foi Possível Cancelar o Agendamento</h1>
                        </div>

                        <div style="padding: 30px;">
                            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 20px;">
                                Prezado(a) <strong>${agendamento.nome}</strong>,
                            </p>

                            <div style="background-color: #fee2e2; border-radius: 6px; padding: 15px; margin: 20px 0;">
                                <p style="color: #991b1b; margin: 0; font-size: 16px;">
                                    <strong>Motivo:</strong><br>
                                    ${error}
                                </p>
                            </div>

                            <div style="background-color: #f9fafb; border-radius: 6px; padding: 20px; margin: 20px 0;">
                                <h2 style="color: #dc2626; font-size: 18px; margin-top: 0; margin-bottom: 15px;">Detalhes do Agendamento</h2>
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                                            <strong>Tipo:</strong> ${agendamento.tipoAgendamento}
                                        </td>
                                    </tr>
                                    ${getDetalhesAgendamento(agendamento.tipoAgendamento, agendamento)}
                                </table>
                            </div>

                            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                                <p style="font-size: 14px; color: #6b7280; margin: 0;">
                                    Este é um e-mail automático. Por favor, não responda.
                                </p>
                                <p style="font-size: 14px; color: #6b7280; margin: 10px 0 0 0;">
                                    Em caso de dúvidas, entre em contato com a equipe Nutrilite.
                                </p>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                emailHtml = gerarTemplateCancelamento(
                    agendamento.nome,
                    agendamento.tipoAgendamento,
                    motivo,
                    agendamento
                );
            }
        } else if (subject.includes('Novo Agendamento Recebido')) {
            emailHtml = gerarTemplateEmailAdmin(agendamento);
        } else {
            const linkCancelamento = gerarLinkCancelamento(agendamento.id);
            emailHtml = html || gerarTemplateEmail(
                agendamento.nome,
                agendamento.tipoAgendamento,
                agendamento.status,
                linkCancelamento,
                agendamento
            );
        }

        if (agendamento.tipoAgendamento === 'Coffee Break' || subject.includes('Cancelado')) {
            to = `${to}, luantavares.developer@gmail.com`;
        }

        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject: error ? "Não Foi Possível Cancelar o Agendamento" : subject,
            text,
            html: emailHtml
        });
    } catch (error) {
        console.error('Erro ao enviar email:', error);
        throw new Error('Erro ao enviar email');
    }
};

module.exports = { sendEmail };
