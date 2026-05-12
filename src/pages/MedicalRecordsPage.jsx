import { useEffect, useMemo, useState } from 'react'

import { FeatureCallout } from '../components/FeatureState.jsx'
import { medicalRecordRepository } from '../repositories/medicalRecordRepository.js'
import { patientRepository } from '../repositories/patientRepository.js'
import { reportRepository } from '../repositories/reportRepository.js'

const inputClass =
  'h-10 w-full rounded-lg border border-[#404040] bg-[#1a1a1a] px-3 text-sm text-[#e5e5e5] outline-none transition placeholder:text-[#a3a3a3] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]'
const textareaClass =
  'min-h-28 w-full rounded-lg border border-[#404040] bg-[#1a1a1a] px-3 py-2 text-sm leading-6 text-[#e5e5e5] outline-none transition placeholder:text-[#a3a3a3] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]'
const labelClass = 'mb-1 block text-xs font-medium text-[#e5e5e5]'
const cardClass = 'rounded-2xl border border-[#404040] bg-[#262626] shadow-sm'

const emptyRecord = {
  patientId: '',
  patient: '',
  patientDocument: '',
  patientEmail: '',
  patientPhone: '',
  dateTime: '',
  doctor: '',
  type: 'Primeira Consulta',
  cid: '',
  status: 'completo',
  diagnosticReasoning: '',
  diagnosticHypotheses: '',
  definitiveDiagnosis: '',
  prescriptions: '',
  procedures: '',
  surgeries: '',
  orientations: '',
  labResults: '',
  imageResults: '',
  multiprofessionalNotes: '',
  signature: '',
  professionalStamp: '',
}

const requiredFields = [
  ['patient', 'paciente'],
  ['dateTime', 'data e hora'],
  ['doctor', 'profissional'],
  ['cid', 'CID ou referência diagnóstica'],
  ['diagnosticReasoning', 'raciocínio médico'],
  ['diagnosticHypotheses', 'hipóteses diagnósticas'],
  ['definitiveDiagnosis', 'diagnóstico definitivo'],
  ['prescriptions', 'prescrição médica'],
  ['procedures', 'procedimentos realizados'],
  ['surgeries', 'cirurgias'],
  ['orientations', 'orientações'],
  ['labResults', 'laudos laboratoriais'],
  ['imageResults', 'laudos de imagem'],
  ['multiprofessionalNotes', 'notas multiprofissionais'],
  ['signature', 'assinatura/carimbo'],
  ['professionalStamp', 'carimbo profissional'],
]

export function MedicalRecordsPage({ navigate, mode = 'list', recordId = '' }) {
  const recordTypes = medicalRecordRepository.getRecordTypes()
  const [records, setRecords] = useState(() => medicalRecordRepository.getAll())
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    let active = true

    patientRepository
      .getDirectoryRows()
      .then((data) => {
        if (active) setPatients(data || [])
      })
      .catch(() => {
        if (active) setPatients([])
      })

    return () => {
      active = false
    }
  }, [])

  const filteredRecords = useMemo(() => {
    const query = normalizeSearch(search)
    return records.filter((record) => {
      if (!query) return true
      return normalizeSearch([record.patient, record.cid, record.doctor, record.type, record.summary].join(' ')).includes(query)
    })
  }, [records, search])

  const selectedRecord = records.find((record) => String(record.id) === String(recordId)) || null
  const selectedPatient = selectedRecord ? findPatient(patients, selectedRecord) : null

  function refreshRecords() {
    setRecords(medicalRecordRepository.getAll())
  }

  function handleCreateRecord(data) {
    const created = medicalRecordRepository.create(data)
    refreshRecords()
    navigate(`/prontuario/${created.id}`)
  }

  function handleUpdateRecord(data) {
    const updated = medicalRecordRepository.update(recordId, data)
    refreshRecords()
    navigate(`/prontuario/${updated?.id || recordId}`)
  }

  if (mode === 'new') {
    return (
      <RecordEditorPage
        navigate={navigate}
        onSave={handleCreateRecord}
        patients={patients}
        recordTypes={recordTypes}
      />
    )
  }

  if (mode === 'edit') {
    return selectedRecord ? (
      <RecordEditorPage
        navigate={navigate}
        onSave={handleUpdateRecord}
        patients={patients}
        record={selectedRecord}
        recordTypes={recordTypes}
      />
    ) : (
      <RecordNotFound navigate={navigate} />
    )
  }

  if (mode === 'detail') {
    return selectedRecord ? (
      <RecordDetailPage
        navigate={navigate}
        patient={selectedPatient}
        record={selectedRecord}
      />
    ) : (
      <RecordNotFound navigate={navigate} />
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 text-[#e5e5e5]">
      <FeatureCallout
        description="Prontuário, listagem e criação de registros ainda usam dados locais e não persistem na API."
        status="mock"
        title="Prontuário ainda é mockado"
      />

      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#e5e5e5]">Prontuário Médico</h1>
          <p className="mt-1 text-sm text-[#a3a3a3]">Registros cronológicos, diagnósticos, condutas e resultados de exames</p>
        </div>
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#3b82f6] px-4 text-sm font-medium text-white transition hover:bg-[#2563eb]"
          onClick={() => navigate('/prontuario/novo')}
          type="button"
        >
          <RecordIcon name="plus" />
          Novo prontuário
        </button>
      </div>

      <section className={`${cardClass} p-4`}>
        <div className="relative">
          <RecordIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#a3a3a3]" name="search" />
          <input
            className="h-10 w-full rounded-lg border border-[#404040] bg-[#1a1a1a] py-2 pl-10 pr-3 text-sm text-[#e5e5e5] outline-none transition placeholder:text-[#a3a3a3] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por paciente, CID, médico ou tipo de registro..."
            value={search}
          />
        </div>
      </section>

      <div className="space-y-3">
        {filteredRecords.length ? (
          filteredRecords.map((record) => (
            <RecordCard
              key={record.id}
              onEdit={() => navigate(`/prontuario/${record.id}/editar`)}
              onOpen={() => navigate(`/prontuario/${record.id}`)}
              onPrint={() => printRecordAsPdf(record)}
              record={record}
            />
          ))
        ) : (
          <div className={`${cardClass} p-8 text-center text-sm text-[#a3a3a3]`}>
            Nenhum registro encontrado nos dados locais.
          </div>
        )}
      </div>
    </div>
  )
}

function RecordCard({ onEdit, onOpen, onPrint, record }) {
  const statusClass =
    record.status === 'completo'
      ? 'bg-emerald-500/20 text-emerald-400'
      : 'bg-amber-500/20 text-amber-400'

  return (
    <article
      className={`${cardClass} cursor-pointer p-5 transition hover:border-[#3b82f6]/30`}
      onClick={onOpen}
      role="button"
      tabIndex={0}
    >
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div className="flex items-start gap-4">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[#3b82f6]/10 text-[#3b82f6]">
            <RecordIcon className="size-5" name="file" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-bold text-[#e5e5e5]">{record.patient}</h2>
              <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${statusClass}`}>
                {record.status === 'completo' ? 'Completo' : 'Rascunho'}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#a3a3a3]">
              <span className="flex items-center gap-1">
                <RecordIcon className="size-3" name="calendar" />
                {formatDateTime(record.dateTime)}
              </span>
              <span className="flex items-center gap-1">
                <RecordIcon className="size-3" name="user" />
                {record.doctor}
              </span>
              <span className="flex items-center gap-1">
                <RecordIcon className="size-3" name="activity" />
                {record.type}
              </span>
            </div>
            <p className="mt-2 inline-block rounded bg-[#1a1a1a] px-2 py-1 text-xs text-[#a3a3a3]">{record.cid}</p>
            <p className="mt-2 text-xs leading-5 text-[#a3a3a3]">{record.summary}</p>
          </div>
        </div>
        <div className="ml-14 flex items-center gap-2 md:ml-0">
          <IconButton label="Visualizar" name="eye" onClick={onOpen} />
          <IconButton label="Editar" name="edit" onClick={onEdit} />
          <IconButton label="Imprimir" name="printer" onClick={onPrint} />
        </div>
      </div>
    </article>
  )
}

function RecordDetailPage({ navigate, patient, record }) {
  const [reports, setReports] = useState(() => medicalRecordRepository.getMockReportHistory(record.patientId, record.patient))

  useEffect(() => {
    let active = true

    loadReportsForPatient(record.patientId, record.patient).then((data) => {
      if (active) setReports(data)
    })

    return () => {
      active = false
    }
  }, [record.patientId, record.patient])

  const chronology = buildChronology(record, reports)

  return (
    <div className="mx-auto max-w-7xl space-y-6 text-[#e5e5e5]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <button className="mb-4 text-sm font-semibold text-[#3b82f6] hover:text-[#66a3ff]" onClick={() => navigate('/prontuario')} type="button">
            ← Voltar para prontuários
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-[#e5e5e5]">Prontuário de {record.patient}</h1>
          <p className="mt-1 text-sm text-[#a3a3a3]">
            Registro cronológico inverso com assinatura profissional e histórico contínuo.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="rounded-lg border border-[#404040] bg-[#262626] px-4 py-2 text-sm font-semibold text-[#e5e5e5] transition hover:bg-[#303030]" onClick={() => navigate(`/prontuario/${record.id}/editar`)} type="button">
            Editar
          </button>
          <button className="rounded-lg border border-[#404040] bg-[#262626] px-4 py-2 text-sm font-semibold text-[#e5e5e5] transition hover:bg-[#303030]" onClick={() => printRecordAsPdf(record, patient, reports)} type="button">
            Imprimir PDF
          </button>
          <button className="rounded-lg border border-[#404040] bg-[#262626] px-4 py-2 text-sm font-semibold text-[#e5e5e5] transition hover:bg-[#303030]" onClick={() => sendRecordByEmail(record, patient)} type="button">
            Enviar por e-mail
          </button>
          <button className="rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2563eb]" onClick={() => sendRecordByWhatsapp(record, patient)} type="button">
            Enviar por WhatsApp
          </button>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-4">
        <DetailCard label="Paciente" value={record.patient} />
        <DetailCard label="Documento" value={patient?.document || record.patientDocument || 'Documento não informado'} />
        <DetailCard label="Data e hora" value={formatDateTime(record.dateTime)} />
        <DetailCard label="Assinatura/Carimbo" value={record.signature} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <ClinicalSection
            items={[
              ['Raciocínio médico', record.diagnosticReasoning],
              ['Hipóteses diagnósticas', record.diagnosticHypotheses],
              ['Diagnóstico definitivo', record.definitiveDiagnosis],
              ['CID / referência', record.cid],
            ]}
            title="Diagnóstico"
          />
          <ClinicalSection
            items={[
              ['Prescrição médica', record.prescriptions],
              ['Procedimentos realizados', record.procedures],
              ['Cirurgias', record.surgeries],
              ['Orientações', record.orientations],
            ]}
            title="Conduta"
          />
          <ClinicalSection
            items={[
              ['Laudos laboratoriais', record.labResults],
              ['Laudos de imagem', record.imageResults],
            ]}
            title="Resultados de Exames"
          />
          <ClinicalSection
            items={[
              ['Notas de outros profissionais', record.multiprofessionalNotes],
              ['Carimbo profissional', record.professionalStamp],
            ]}
            title="Multiprofissional e Legal"
          />
        </div>

        <div className="space-y-6">
          <PatientReportHistory fallbackReports={reports} patientId={record.patientId} patientName={record.patient} />
          <ChronologyPanel entries={chronology} />
        </div>
      </section>
    </div>
  )
}

function RecordEditorPage({ navigate, onSave, patients, record, recordTypes }) {
  const [patientSearch, setPatientSearch] = useState(record?.patient || '')
  const [formData, setFormData] = useState(() => ({
    ...emptyRecord,
    dateTime: toDateTimeLocal(new Date()),
    doctor: 'Dr. Henrique Cardoso',
    signature: 'Dr. Henrique Cardoso - CRM não informado',
    professionalStamp: 'Assinado digitalmente por Dr. Henrique Cardoso',
    ...record,
  }))

  const filteredPatients = useMemo(() => {
    const query = normalizeSearch(patientSearch)
    if (!query) return patients.slice(0, 8)

    return patients
      .filter((patient) =>
        normalizeSearch([patient.name, patient.full_name, patient.nome, patient.cpf, patient.document, patient.email].filter(Boolean).join(' ')).includes(query),
      )
      .slice(0, 8)
  }, [patientSearch, patients])

  function updateField(event) {
    const { name, value } = event.target
    setFormData((currentData) => ({ ...currentData, [name]: value }))
  }

  function selectPatient(patient) {
    const patientName = getPatientName(patient)
    setPatientSearch(patientName)
    setFormData((currentData) => ({
      ...currentData,
      patientId: String(patient.id || ''),
      patient: patientName,
      patientDocument: patient.document || patient.cpf || '',
      patientEmail: patient.email || '',
      patientPhone: patient.phone || patient.phone_mobile || patient.telefone || '',
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const missing = requiredFields.filter(([field]) => !String(formData[field] || '').trim())

    if (missing.length) {
      alert(`Preencha os campos obrigatórios: ${missing.map(([, label]) => label).join(', ')}.`)
      return
    }

    const summary = formData.definitiveDiagnosis || formData.diagnosticReasoning
    onSave({
      ...formData,
      summary,
      date: formatDateTime(formData.dateTime),
    })
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 text-[#e5e5e5]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <button className="mb-4 text-sm font-semibold text-[#3b82f6] hover:text-[#66a3ff]" onClick={() => navigate(record ? `/prontuario/${record.id}` : '/prontuario')} type="button">
            ← Voltar
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-[#e5e5e5]">{record ? 'Editar prontuário' : 'Novo prontuário'}</h1>
          <p className="mt-1 text-sm text-[#a3a3a3]">
            Preencha os dados clínicos, legais e multiprofissionais obrigatórios do registro.
          </p>
        </div>
      </div>

      <form className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]" onSubmit={handleSubmit}>
        <div className={`${cardClass} space-y-6 p-5`}>
          <div className="grid gap-4 md:grid-cols-2">
            <DarkField label="Paciente *">
              <input
                className={inputClass}
                onChange={(event) => {
                  setPatientSearch(event.target.value)
                  setFormData((currentData) => ({ ...currentData, patientId: '', patient: event.target.value }))
                }}
                placeholder="Buscar paciente..."
                type="search"
                value={patientSearch}
              />
              <PatientPickList
                items={filteredPatients}
                onSelect={selectPatient}
                selectedId={formData.patientId}
              />
            </DarkField>
            <DarkField label="Status *">
              <select className={inputClass} name="status" onChange={updateField} value={formData.status}>
                <option value="completo">Completo</option>
                <option value="rascunho">Rascunho</option>
              </select>
            </DarkField>
            <DarkField label="Data e hora do registro *">
              <input className={`${inputClass} [color-scheme:dark]`} name="dateTime" onChange={updateField} type="datetime-local" value={formData.dateTime} />
            </DarkField>
            <DarkField label="Tipo de registro *">
              <select className={inputClass} name="type" onChange={updateField} value={formData.type}>
                {recordTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </DarkField>
            <DarkField label="Profissional responsável *">
              <input className={inputClass} name="doctor" onChange={updateField} value={formData.doctor} />
            </DarkField>
            <DarkField label="CID / referência diagnóstica *">
              <input className={inputClass} name="cid" onChange={updateField} placeholder="Ex: I10, E11.9..." value={formData.cid} />
            </DarkField>
          </div>

          <FormSection title="Diagnóstico">
            <DarkField label="Raciocínio médico *">
              <textarea className={textareaClass} name="diagnosticReasoning" onChange={updateField} value={formData.diagnosticReasoning} />
            </DarkField>
            <DarkField label="Hipóteses diagnósticas *">
              <textarea className={textareaClass} name="diagnosticHypotheses" onChange={updateField} value={formData.diagnosticHypotheses} />
            </DarkField>
            <DarkField label="Diagnóstico definitivo *">
              <textarea className={textareaClass} name="definitiveDiagnosis" onChange={updateField} value={formData.definitiveDiagnosis} />
            </DarkField>
          </FormSection>

          <FormSection title="Conduta">
            <DarkField label="Histórico de prescrição médica *">
              <textarea className={textareaClass} name="prescriptions" onChange={updateField} value={formData.prescriptions} />
            </DarkField>
            <DarkField label="Procedimentos realizados *">
              <textarea className={textareaClass} name="procedures" onChange={updateField} value={formData.procedures} />
            </DarkField>
            <DarkField label="Cirurgias *">
              <textarea className={textareaClass} name="surgeries" onChange={updateField} value={formData.surgeries} />
            </DarkField>
            <DarkField label="Orientações *">
              <textarea className={textareaClass} name="orientations" onChange={updateField} value={formData.orientations} />
            </DarkField>
          </FormSection>

          <FormSection title="Resultados de Exames">
            <DarkField label="Laudos laboratoriais *">
              <textarea className={textareaClass} name="labResults" onChange={updateField} value={formData.labResults} />
            </DarkField>
            <DarkField label="Laudos de imagem *">
              <textarea className={textareaClass} name="imageResults" onChange={updateField} value={formData.imageResults} />
            </DarkField>
          </FormSection>

          <FormSection title="Multiprofissional e Legal">
            <DarkField label="Notas de outros médicos/profissionais *">
              <textarea className={textareaClass} name="multiprofessionalNotes" onChange={updateField} value={formData.multiprofessionalNotes} />
            </DarkField>
            <div className="grid gap-4 md:grid-cols-2">
              <DarkField label="Assinatura/carimbo *">
                <input className={inputClass} name="signature" onChange={updateField} value={formData.signature} />
              </DarkField>
              <DarkField label="Registro legal do profissional *">
                <input className={inputClass} name="professionalStamp" onChange={updateField} value={formData.professionalStamp} />
              </DarkField>
            </div>
          </FormSection>

          <div className="flex flex-wrap justify-end gap-3 border-t border-[#404040] pt-4">
            <button className="rounded-lg border border-[#404040] bg-[#262626] px-4 py-2 text-sm font-medium text-[#e5e5e5] transition hover:bg-[#333333]" onClick={() => navigate(record ? `/prontuario/${record.id}` : '/prontuario')} type="button">
              Cancelar
            </button>
            <button className="rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2563eb]" type="submit">
              Salvar
            </button>
          </div>
        </div>

        <aside className="space-y-6">
          <PatientReportHistory
            fallbackReports={medicalRecordRepository.getMockReportHistory(formData.patientId, formData.patient)}
            patientId={formData.patientId}
            patientName={formData.patient}
          />
          <div className={`${cardClass} p-5`}>
            <h2 className="text-sm font-bold text-[#e5e5e5]">Regras técnicas e legais</h2>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-[#a3a3a3]">
              <li>Registre data, hora e assinatura/carimbo do profissional.</li>
              <li>Mantenha texto legível, sem rasuras e organizado por seções.</li>
              <li>Use ordem cronológica inversa para revisões e histórico.</li>
              <li>Inclua notas multiprofissionais quando houver participação de outros profissionais.</li>
            </ul>
          </div>
        </aside>
      </form>
    </div>
  )
}

function PatientPickList({ items, onSelect, selectedId }) {
  return (
    <div className="mt-2 max-h-44 overflow-y-auto rounded-lg border border-[#404040] bg-[#1a1a1a]">
      {items.length ? (
        items.map((patient) => {
          const selected = String(patient.id || '') === String(selectedId || '')
          return (
            <button
              className={`block w-full px-3 py-2 text-left text-sm transition ${
                selected ? 'bg-[#3b82f6]/20 text-[#e5e5e5]' : 'text-[#a3a3a3] hover:bg-[#2a2a2a] hover:text-[#e5e5e5]'
              }`}
              key={patient.id || getPatientName(patient)}
              onClick={() => onSelect(patient)}
              type="button"
            >
              <span className="block font-semibold">{getPatientName(patient)}</span>
              <span className="mt-0.5 block text-xs text-[#737373]">{patient.cpf || patient.document || patient.email || 'Sem documento'}</span>
            </button>
          )
        })
      ) : (
        <p className="px-3 py-2 text-xs text-[#737373]">Nenhum paciente encontrado.</p>
      )}
    </div>
  )
}

function PatientReportHistory({ fallbackReports = [], patientId, patientName }) {
  const [reportState, setReportState] = useState({ patientId: '', reports: [] })
  const reports = patientId && reportState.patientId === patientId ? reportState.reports : fallbackReports
  const loading = Boolean(patientId && reportState.patientId !== patientId)

  useEffect(() => {
    if (!patientId) return undefined

    let active = true

    loadReportsForPatient(patientId, patientName).then((data) => {
      if (!active) return
      setReportState({ patientId, reports: data.length ? data : fallbackReports })
    })

    return () => {
      active = false
    }
  }, [fallbackReports, patientId, patientName])

  return (
    <section className={`${cardClass} p-5`}>
      <h2 className="text-sm font-bold text-[#e5e5e5]">Histórico contínuo de relatórios</h2>
      <p className="mt-1 text-xs text-[#a3a3a3]">Ordem cronológica inversa do paciente selecionado.</p>
      <div className="mt-4 space-y-3">
        {loading ? (
          <p className="text-sm text-[#a3a3a3]">Carregando relatórios...</p>
        ) : reports.length ? (
          reports.map((report) => (
            <div className="rounded-lg border border-[#404040] bg-[#1a1a1a] p-3" key={report.id}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-[#e5e5e5]">{report.title}</p>
                <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">{report.status}</span>
              </div>
              <p className="mt-1 text-xs text-[#a3a3a3]">{formatDateTime(report.createdAt)} • {report.author}</p>
              <p className="mt-2 text-xs leading-5 text-[#a3a3a3]">{report.summary}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-[#a3a3a3]">Nenhum relatório encontrado para este paciente.</p>
        )}
      </div>
    </section>
  )
}

function ChronologyPanel({ entries }) {
  return (
    <section className={`${cardClass} p-5`}>
      <h2 className="text-sm font-bold text-[#e5e5e5]">Cronologia clínica</h2>
      <div className="mt-4 space-y-3">
        {entries.map((entry) => (
          <div className="rounded-lg border border-[#404040] bg-[#1a1a1a] p-3" key={entry.id}>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#3b82f6]">{entry.kind}</p>
            <p className="mt-1 text-sm font-semibold text-[#e5e5e5]">{entry.title}</p>
            <p className="mt-1 text-xs text-[#a3a3a3]">{formatDateTime(entry.createdAt)} • {entry.author}</p>
            <p className="mt-2 text-xs leading-5 text-[#a3a3a3]">{entry.summary}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function ClinicalSection({ items, title }) {
  return (
    <section className={`${cardClass} p-5`}>
      <h2 className="text-base font-bold text-[#e5e5e5]">{title}</h2>
      <div className="mt-4 grid gap-3">
        {items.map(([label, value]) => (
          <div className="rounded-lg border border-[#404040] bg-[#1a1a1a] p-4" key={label}>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#a3a3a3]">{label}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#e5e5e5]">{value || `${label} não informado`}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function FormSection({ children, title }) {
  return (
    <section className="space-y-4 rounded-xl border border-[#404040] bg-[#202020] p-4">
      <h2 className="text-sm font-bold text-[#e5e5e5]">{title}</h2>
      {children}
    </section>
  )
}

function DetailCard({ label, value }) {
  return (
    <div className={`${cardClass} p-4`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#a3a3a3]">{label}</p>
      <p className="mt-2 text-sm leading-5 text-[#e5e5e5]">{value || `${label} não informado`}</p>
    </div>
  )
}

function IconButton({ label, name, onClick }) {
  return (
    <button
      aria-label={label}
      className="grid size-9 place-items-center rounded-lg border border-[#404040] bg-[#1a1a1a] text-[#a3a3a3] transition hover:bg-[#2a2a2a] hover:text-[#e5e5e5]"
      onClick={(event) => {
        event.stopPropagation()
        onClick?.()
      }}
      title={label}
      type="button"
    >
      <RecordIcon className="size-4" name={name} />
    </button>
  )
}

function DarkField({ children, label }) {
  return (
    <div className="block">
      <span className={labelClass}>{label}</span>
      {children}
    </div>
  )
}

function RecordNotFound({ navigate }) {
  return (
    <div className={`${cardClass} mx-auto max-w-2xl p-8 text-center`}>
      <h1 className="text-xl font-bold text-[#e5e5e5]">Prontuário não encontrado</h1>
      <p className="mt-2 text-sm text-[#a3a3a3]">O registro solicitado não existe nos dados locais.</p>
      <button className="mt-5 rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-semibold text-white" onClick={() => navigate('/prontuario')} type="button">
        Voltar para prontuários
      </button>
    </div>
  )
}

async function loadReportsForPatient(patientId, patientName) {
  if (!patientId) return medicalRecordRepository.getMockReportHistory(patientId, patientName)

  try {
    const reports = await reportRepository.getInitialReports({ patientId, order: 'created_at.desc' })
    const mapped = reports.map((report) => ({
      id: report.id,
      title: report.exam || report.orderNumber || 'Relatório médico',
      status: report.status === 'finalized' ? 'Finalizado' : 'Rascunho',
      createdAt: report.createdAt || report.dueAt,
      author: report.requestedBy || report.createdByName || 'Profissional não informado',
      summary: stripHtml(report.contentHtml) || report.diagnosis || report.conclusion || 'Relatório sem complemento.',
    }))
    return mapped.length ? mapped : medicalRecordRepository.getMockReportHistory(patientId, patientName)
  } catch {
    return medicalRecordRepository.getMockReportHistory(patientId, patientName)
  }
}

function buildChronology(record, reports) {
  return [
    {
      id: `${record.id}-record`,
      kind: 'Prontuário',
      title: `${record.type} • ${record.cid}`,
      createdAt: record.dateTime || record.createdAt,
      author: record.signature || record.doctor,
      summary: record.summary,
    },
    ...reports.map((report) => ({
      id: `report-${report.id}`,
      kind: 'Relatório',
      title: report.title,
      createdAt: report.createdAt,
      author: report.author,
      summary: report.summary,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

function findPatient(patients, record) {
  return patients.find((patient) => String(patient.id || '') === String(record.patientId || '')) ||
    patients.find((patient) => normalizeSearch(getPatientName(patient)) === normalizeSearch(record.patient)) ||
    null
}

function getPatientName(patient) {
  return patient?.name || patient?.full_name || patient?.nome || ''
}

function formatDateTime(value) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value || 'Data não informada'
  return parsed.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

function toDateTimeLocal(value) {
  const parsed = value instanceof Date ? value : new Date(value)
  const safeDate = Number.isNaN(parsed.getTime()) ? new Date() : parsed
  const year = safeDate.getFullYear()
  const month = String(safeDate.getMonth() + 1).padStart(2, '0')
  const day = String(safeDate.getDate()).padStart(2, '0')
  const hours = String(safeDate.getHours()).padStart(2, '0')
  const minutes = String(safeDate.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function normalizeSearch(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function stripHtml(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function printRecordAsPdf(record, patient, reports = []) {
  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=900,height=1100')
  if (!printWindow) {
    window.print()
    return
  }

  const reportItems = reports.map((report) => `<li><strong>${escapeHtml(report.title)}</strong> - ${escapeHtml(formatDateTime(report.createdAt))}: ${escapeHtml(report.summary)}</li>`).join('')
  printWindow.document.write(`
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>Prontuário - ${escapeHtml(record.patient)}</title>
        <style>
          * { box-sizing: border-box; }
          body { color: #171717; font-family: Arial, sans-serif; margin: 32px; }
          h1 { font-size: 22px; margin: 0 0 8px; }
          h2 { border-bottom: 1px solid #d4d4d4; font-size: 15px; margin-top: 24px; padding-bottom: 6px; }
          p, li { font-size: 12px; line-height: 1.55; }
          .grid { display: grid; gap: 8px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .box { border: 1px solid #d4d4d4; border-radius: 8px; padding: 10px; }
          .label { color: #525252; font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
          @media print { body { margin: 22mm; } }
        </style>
      </head>
      <body>
        <h1>Prontuário Médico</h1>
        <p>Paciente: <strong>${escapeHtml(record.patient)}</strong></p>
        <div class="grid">
          ${printDetail('Documento', patient?.document || record.patientDocument || '-')}
          ${printDetail('Data e hora', formatDateTime(record.dateTime))}
          ${printDetail('Profissional', record.doctor)}
          ${printDetail('Assinatura/Carimbo', record.signature)}
        </div>
        <h2>Diagnóstico</h2>
        <p><strong>Raciocínio médico:</strong> ${escapeHtml(record.diagnosticReasoning)}</p>
        <p><strong>Hipóteses:</strong> ${escapeHtml(record.diagnosticHypotheses)}</p>
        <p><strong>Diagnóstico definitivo:</strong> ${escapeHtml(record.definitiveDiagnosis)}</p>
        <h2>Conduta</h2>
        <p><strong>Prescrição:</strong> ${escapeHtml(record.prescriptions)}</p>
        <p><strong>Procedimentos:</strong> ${escapeHtml(record.procedures)}</p>
        <p><strong>Cirurgias:</strong> ${escapeHtml(record.surgeries)}</p>
        <p><strong>Orientações:</strong> ${escapeHtml(record.orientations)}</p>
        <h2>Resultados de Exames</h2>
        <p><strong>Laboratoriais:</strong> ${escapeHtml(record.labResults)}</p>
        <p><strong>Imagem:</strong> ${escapeHtml(record.imageResults)}</p>
        <h2>Multiprofissional</h2>
        <p>${escapeHtml(record.multiprofessionalNotes)}</p>
        <h2>Histórico de Relatórios</h2>
        <ul>${reportItems || '<li>Nenhum relatório vinculado.</li>'}</ul>
      </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}

function printDetail(label, value) {
  return `<div class="box"><div class="label">${escapeHtml(label)}</div><p>${escapeHtml(value || '-')}</p></div>`
}

function sendRecordByEmail(record, patient) {
  const email = patient?.email || record.patientEmail
  if (!email) {
    alert('E-mail do paciente não informado.')
    return
  }

  const subject = encodeURIComponent(`Cópia do prontuário - ${record.patient}`)
  const body = encodeURIComponent('Segue orientação para emissão da cópia em PDF do prontuário solicitado pelo paciente.')
  window.location.href = `mailto:${email}?subject=${subject}&body=${body}`
}

function sendRecordByWhatsapp(record, patient) {
  const phone = onlyDigits(patient?.phone || record.patientPhone)
  if (!phone) {
    alert('WhatsApp/celular do paciente não informado.')
    return
  }

  const message = encodeURIComponent(`Olá, ${record.patient}. A cópia do seu prontuário está disponível para envio em PDF pela clínica.`)
  window.open(`https://wa.me/55${phone}?text=${message}`, '_blank', 'noopener,noreferrer')
}

function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '')
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function RecordIcon({ className = 'size-4', name }) {
  const common = {
    className,
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: 1.8,
    viewBox: '0 0 24 24',
  }

  if (name === 'search') {
    return (
      <svg {...common}>
        <path d="m21 21-4.3-4.3" />
        <circle cx="11" cy="11" r="7" />
      </svg>
    )
  }

  if (name === 'plus') {
    return (
      <svg {...common}>
        <path d="M12 5v14M5 12h14" />
      </svg>
    )
  }

  if (name === 'file') {
    return (
      <svg {...common}>
        <path d="M7 3h7l4 4v14H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
        <path d="M14 3v5h5M9 13h6M9 17h6" />
      </svg>
    )
  }

  if (name === 'calendar') {
    return (
      <svg {...common}>
        <path d="M8 3v3M16 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
      </svg>
    )
  }

  if (name === 'user') {
    return (
      <svg {...common}>
        <path d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
      </svg>
    )
  }

  if (name === 'activity') {
    return (
      <svg {...common}>
        <path d="M3 12h4l2-5 4 10 2-5h6" />
      </svg>
    )
  }

  if (name === 'eye') {
    return (
      <svg {...common}>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  }

  if (name === 'edit') {
    return (
      <svg {...common}>
        <path d="m16 3 5 5L8 21H3v-5L16 3Z" />
      </svg>
    )
  }

  if (name === 'printer') {
    return (
      <svg {...common}>
        <path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
        <path d="M7 14h10v7H7zM17 12h.01" />
      </svg>
    )
  }

  return (
    <svg {...common}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}
