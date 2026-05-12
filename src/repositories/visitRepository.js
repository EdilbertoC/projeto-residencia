import { careQueue as mockCareQueue } from '../data/mockData.js'

export const visitRepository = {
  getCareQueue() {
    return mockCareQueue
  },

  getStages() {
    return [
      { title: 'Triagem', description: 'Sinais vitais, queixa principal e alerta de risco antes da chamada medica.' },
      { title: 'Atendimento médico', description: 'Consulta em andamento, conduta, prescrição e solicitação de exames.' },
      { title: 'Pos-consulta', description: 'Orientacoes finais, documentos emitidos e retorno sugerido pela equipe.' },
    ]
  },
}
