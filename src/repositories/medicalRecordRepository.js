const STORAGE_KEY = 'mediconnect.medicalRecords.v2'

const INITIAL_RECORDS = [
  {
    id: 'record-1',
    patientId: 'mock-carlos-eduardo',
    patient: 'Carlos Eduardo Santos',
    patientDocument: 'CPF nao informado',
    patientEmail: 'carlos.santos@example.com',
    patientPhone: '11999990001',
    dateTime: '2026-03-27T10:30',
    createdAt: '2026-03-27T10:30:00.000Z',
    updatedAt: '2026-03-27T10:30:00.000Z',
    doctor: 'Dra. Ana Silva',
    type: 'Consulta Retorno',
    cid: 'I10 - Hipertensao',
    status: 'completo',
    summary: 'Paciente relata melhora com medicacao. PA: 130/85. Mantida conduta.',
    diagnosticReasoning: 'Quadro compativel com hipertensao arterial sistemica em acompanhamento, com melhora apos adesao medicamentosa.',
    diagnosticHypotheses: 'HAS primaria; efeito de baixa adesao previa ao tratamento; risco cardiovascular global moderado.',
    definitiveDiagnosis: 'Hipertensao arterial sistemica controlada.',
    prescriptions: 'Manter losartana 50 mg de 12/12h e hidroclorotiazida 25 mg pela manha.',
    procedures: 'Afericao pressorica seriada e orientacao sobre automonitoramento domiciliar.',
    surgeries: 'Nao se aplica no atendimento atual.',
    orientations: 'Reduzir sodio, manter atividade fisica regular e retornar com diario pressorico.',
    labResults: 'Exames laboratoriais sem alteracoes relevantes no periodo.',
    imageResults: 'Sem exames de imagem novos para este atendimento.',
    multiprofessionalNotes: 'Enfermagem orientou tecnica correta de afericao de pressao arterial.',
    signature: 'Dra. Ana Silva - CRM 123456',
    professionalStamp: 'Assinado digitalmente por Dra. Ana Silva em 27/03/2026 10:30',
  },
  {
    id: 'record-2',
    patientId: 'mock-mariana-costa',
    patient: 'Mariana Costa',
    patientDocument: 'CPF nao informado',
    patientEmail: 'mariana.costa@example.com',
    patientPhone: '11999990002',
    dateTime: '2026-03-26T15:00',
    createdAt: '2026-03-26T15:00:00.000Z',
    updatedAt: '2026-03-26T15:00:00.000Z',
    doctor: 'Dra. Ana Silva',
    type: 'Exame',
    cid: 'Z01.7 - Exame laboratorial',
    status: 'completo',
    summary: 'Resultados de hemograma dentro da normalidade. Solicitar retorno em 6 meses.',
    diagnosticReasoning: 'Resultados laboratoriais analisados em conjunto com quadro clinico estavel.',
    diagnosticHypotheses: 'Acompanhamento preventivo sem sinais laboratoriais de alarme.',
    definitiveDiagnosis: 'Exame laboratorial sem alteracoes clinicamente significativas.',
    prescriptions: 'Sem nova prescricao medicamentosa.',
    procedures: 'Revisao de exames laboratoriais e comparacao com historico previo.',
    surgeries: 'Nao se aplica.',
    orientations: 'Manter rotina preventiva e retorno em 6 meses ou antes se houver sintomas.',
    labResults: 'Hemograma completo dentro dos parametros de referencia.',
    imageResults: 'Sem exames de imagem relacionados.',
    multiprofessionalNotes: 'Equipe administrativa orientou retirada de copia dos exames.',
    signature: 'Dra. Ana Silva - CRM 123456',
    professionalStamp: 'Assinado digitalmente por Dra. Ana Silva em 26/03/2026 15:00',
  },
  {
    id: 'record-3',
    patientId: 'mock-joao-pedro',
    patient: 'Joao Pedro Alves',
    patientDocument: 'CPF nao informado',
    patientEmail: 'joao.alves@example.com',
    patientPhone: '11999990003',
    dateTime: '2026-03-25T09:15',
    createdAt: '2026-03-25T09:15:00.000Z',
    updatedAt: '2026-03-25T09:15:00.000Z',
    doctor: 'Dr. Carlos Mendes',
    type: 'Primeira Consulta',
    cid: 'R10 - Dor abdominal',
    status: 'rascunho',
    summary: 'Queixa de dor abdominal ha 2 semanas. Solicitados exames complementares.',
    diagnosticReasoning: 'Dor abdominal subaguda, sem sinais de peritonite, em investigacao etiologica.',
    diagnosticHypotheses: 'Dispepsia funcional; gastrite; doenca biliar; sindrome do intestino irritavel.',
    definitiveDiagnosis: 'Diagnostico definitivo pendente de exames complementares.',
    prescriptions: 'Sintomatico conforme dor e orientacao de retorno se piora.',
    procedures: 'Exame fisico abdominal e solicitacao de exames complementares.',
    surgeries: 'Nao indicada ate o momento.',
    orientations: 'Retornar com exames, procurar urgencia se febre, vomitos persistentes ou dor intensa.',
    labResults: 'Hemograma, PCR e funcao hepatica solicitados.',
    imageResults: 'Ultrassonografia abdominal solicitada.',
    multiprofessionalNotes: 'Nutricionista podera ser acionada conforme resultado dos exames.',
    signature: 'Dr. Carlos Mendes - CRM 654321',
    professionalStamp: 'Rascunho criado por Dr. Carlos Mendes em 25/03/2026 09:15',
  },
  {
    id: 'record-4',
    patientId: 'mock-fernanda-lima',
    patient: 'Fernanda Lima',
    patientDocument: 'CPF nao informado',
    patientEmail: 'fernanda.lima@example.com',
    patientPhone: '11999990004',
    dateTime: '2026-03-24T11:00',
    createdAt: '2026-03-24T11:00:00.000Z',
    updatedAt: '2026-03-24T11:00:00.000Z',
    doctor: 'Dra. Ana Silva',
    type: 'Avaliacao Pre-Op',
    cid: 'K80 - Colelitiase',
    status: 'completo',
    summary: 'Apta para procedimento cirurgico. Exames pre-operatorios normais.',
    diagnosticReasoning: 'Colelitiase sintomatica com avaliacao clinica favoravel para procedimento proposto.',
    diagnosticHypotheses: 'Colelitiase sintomatica; baixo risco cardiopulmonar para cirurgia eletiva.',
    definitiveDiagnosis: 'Colelitiase com indicacao de abordagem cirurgica eletiva.',
    prescriptions: 'Manter medicacoes habituais conforme orientacao anestesica.',
    procedures: 'Avaliacao pre-operatoria e revisao de exames.',
    surgeries: 'Colecistectomia videolaparoscopica proposta pela equipe cirurgica.',
    orientations: 'Jejum e orientacoes pre-operatorias conforme protocolo institucional.',
    labResults: 'Hemograma, coagulograma e funcao renal sem contraindicacoes.',
    imageResults: 'Ultrassonografia com colelitíase, sem sinais de colecistite aguda.',
    multiprofessionalNotes: 'Anestesia orientou avaliacao pre-anestesica complementar.',
    signature: 'Dra. Ana Silva - CRM 123456',
    professionalStamp: 'Assinado digitalmente por Dra. Ana Silva em 24/03/2026 11:00',
  },
  {
    id: 'record-5',
    patientId: 'mock-roberto-campos',
    patient: 'Roberto Campos',
    patientDocument: 'CPF nao informado',
    patientEmail: 'roberto.campos@example.com',
    patientPhone: '11999990005',
    dateTime: '2026-03-22T16:20',
    createdAt: '2026-03-22T16:20:00.000Z',
    updatedAt: '2026-03-22T16:20:00.000Z',
    doctor: 'Dr. Roberto Nunes',
    type: 'Consulta Retorno',
    cid: 'E11 - DM Tipo 2',
    status: 'completo',
    summary: 'HbA1c: 7.2%. Ajuste de metformina. Retorno em 3 meses.',
    diagnosticReasoning: 'Diabetes mellitus tipo 2 com controle parcial, necessitando ajuste terapeutico.',
    diagnosticHypotheses: 'DM2 em controle parcial; risco metabolico associado.',
    definitiveDiagnosis: 'Diabetes mellitus tipo 2.',
    prescriptions: 'Ajuste de metformina conforme tolerancia e manutencao de medidas nao farmacologicas.',
    procedures: 'Revisao de exames metabolicos e avaliacao de adesao.',
    surgeries: 'Nao se aplica.',
    orientations: 'Dieta, atividade fisica, monitoramento glicemico e retorno em 3 meses.',
    labResults: 'HbA1c 7,2%; demais exames revisados em consulta.',
    imageResults: 'Sem exames de imagem novos.',
    multiprofessionalNotes: 'Encaminhado para orientacao nutricional.',
    signature: 'Dr. Roberto Nunes - CRM 778899',
    professionalStamp: 'Assinado digitalmente por Dr. Roberto Nunes em 22/03/2026 16:20',
  },
]

export const medicalRecordRepository = {
  getRecordTypes() {
    return ['Consulta Retorno', 'Primeira Consulta', 'Exame', 'Avaliacao Pre-Op', 'Evolucao Clinica', 'Registro Multiprofissional']
  },

  getInitialRecords() {
    return readRecords()
  },

  getAll() {
    return readRecords()
  },

  getById(recordId) {
    return readRecords().find((record) => String(record.id) === String(recordId)) || null
  },

  create(data) {
    const records = readRecords()
    const now = new Date().toISOString()
    const record = normalizeRecord({
      ...data,
      id: data.id || `record-${Date.now()}`,
      createdAt: data.createdAt || now,
      updatedAt: now,
    })

    writeRecords([record, ...records])
    return record
  },

  update(recordId, data) {
    const records = readRecords()
    const now = new Date().toISOString()
    let updatedRecord = null
    const nextRecords = records.map((record) => {
      if (String(record.id) !== String(recordId)) return record
      updatedRecord = normalizeRecord({ ...record, ...data, id: record.id, updatedAt: now })
      return updatedRecord
    })

    writeRecords(nextRecords)
    return updatedRecord
  },

  getMockReportHistory(patientId, patientName) {
    const baseName = patientName || 'Paciente'
    return [
      {
        id: `${patientId || 'mock'}-report-1`,
        title: 'Relatorio de consulta medica',
        status: 'Finalizado',
        createdAt: '2026-03-27T13:30:00.000Z',
        author: 'Dra. Ana Silva',
        summary: `Resumo clinico recente de ${baseName}, com conduta registrada em prontuario.`,
      },
      {
        id: `${patientId || 'mock'}-report-2`,
        title: 'Laudo de exame',
        status: 'Finalizado',
        createdAt: '2026-03-20T09:00:00.000Z',
        author: 'Dr. Carlos Mendes',
        summary: 'Resultado complementar revisado pela equipe assistencial.',
      },
    ]
  },
}

function readRecords() {
  if (typeof window === 'undefined') return INITIAL_RECORDS.map(normalizeRecord)

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const initial = INITIAL_RECORDS.map(normalizeRecord)
      writeRecords(initial)
      return initial
    }

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return INITIAL_RECORDS.map(normalizeRecord)
    return parsed.map(normalizeRecord).sort(sortByDateDesc)
  } catch {
    return INITIAL_RECORDS.map(normalizeRecord)
  }
}

function writeRecords(records) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records.map(normalizeRecord).sort(sortByDateDesc)))
  } catch {
    // Local persistence is best-effort while the module is still mock-backed.
  }
}

function normalizeRecord(record) {
  const dateTime = record.dateTime || parseLegacyDate(record.date) || toLocalInputValue(new Date())
  const summary = record.summary || record.orientations || record.diagnosticReasoning || 'Registro de prontuario sem resumo.'

  return {
    id: String(record.id || `record-${Date.now()}`),
    patientId: String(record.patientId || ''),
    patient: record.patient || 'Paciente sem nome',
    patientDocument: record.patientDocument || record.document || '',
    patientEmail: record.patientEmail || record.email || '',
    patientPhone: record.patientPhone || record.phone || '',
    dateTime,
    date: record.date || formatDateTime(dateTime),
    createdAt: record.createdAt || toIso(dateTime),
    updatedAt: record.updatedAt || record.createdAt || toIso(dateTime),
    doctor: record.doctor || record.professional || 'Profissional nao informado',
    type: record.type || 'Primeira Consulta',
    cid: record.cid || 'CID nao informado',
    status: record.status === 'rascunho' ? 'rascunho' : 'completo',
    summary,
    diagnosticReasoning: record.diagnosticReasoning || record.anamnesis || summary,
    diagnosticHypotheses: record.diagnosticHypotheses || record.cid || 'Hipoteses diagnosticas nao informadas.',
    definitiveDiagnosis: record.definitiveDiagnosis || record.cid || 'Diagnostico definitivo nao informado.',
    prescriptions: record.prescriptions || 'Prescricao nao informada.',
    procedures: record.procedures || record.physicalExam || 'Procedimentos nao informados.',
    surgeries: record.surgeries || 'Cirurgias nao informadas ou nao se aplica.',
    orientations: record.orientations || record.conduct || 'Orientacoes nao informadas.',
    labResults: record.labResults || 'Laudos laboratoriais nao informados.',
    imageResults: record.imageResults || 'Laudos de imagem nao informados.',
    multiprofessionalNotes: record.multiprofessionalNotes || 'Notas multiprofissionais nao informadas.',
    signature: record.signature || record.doctor || 'Assinatura nao informada.',
    professionalStamp: record.professionalStamp || `Registro assinado por ${record.doctor || 'profissional nao informado'}.`,
  }
}

function sortByDateDesc(a, b) {
  return new Date(b.dateTime || b.createdAt).getTime() - new Date(a.dateTime || a.createdAt).getTime()
}

function parseLegacyDate(value) {
  const match = String(value || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return ''
  return `${match[3]}-${match[2]}-${match[1]}T09:00`
}

function toIso(value) {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString()
}

function toLocalInputValue(date) {
  const parsed = date instanceof Date ? date : new Date(date)
  const safeDate = Number.isNaN(parsed.getTime()) ? new Date() : parsed
  const year = safeDate.getFullYear()
  const month = String(safeDate.getMonth() + 1).padStart(2, '0')
  const day = String(safeDate.getDate()).padStart(2, '0')
  const hours = String(safeDate.getHours()).padStart(2, '0')
  const minutes = String(safeDate.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function formatDateTime(value) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Data nao informada'
  return parsed.toLocaleString('pt-BR')
}
