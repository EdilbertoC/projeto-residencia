import { useCallback, useEffect, useMemo, useState } from 'react'

import { patientRepository } from '../repositories/patientRepository.js'
import { professionalRepository } from '../repositories/professionalRepository.js'
import { reportRepository } from '../repositories/reportRepository.js'

const ITEMS_PER_PAGE = 25

const statusConfig = {
  draft: {
    label: 'Rascunho',
    pill: 'bg-amber-500/20 text-amber-400',
    stat: 'text-amber-400',
  },
}

const orderOptions = [
  { label: 'Criacao mais recente', value: 'created_at.desc' },
  { label: 'Criacao mais antiga', value: 'created_at.asc' },
  { label: 'Prazo mais proximo', value: 'due_at.asc' },
  { label: 'Prazo mais distante', value: 'due_at.desc' },
]

const inputClass =
  'h-10 w-full rounded-lg border border-[#404040] bg-[#1a1a1a] px-3 text-sm text-[#e5e5e5] outline-none transition placeholder:text-[#a3a3a3] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]'
const textareaClass =
  'min-h-24 w-full rounded-lg border border-[#404040] bg-[#1a1a1a] px-3 py-2 text-sm text-[#e5e5e5] outline-none transition placeholder:text-[#a3a3a3] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]'
const labelClass = 'mb-1.5 block text-xs font-medium text-[#e5e5e5]'
const cardClass = 'rounded-2xl border border-[#404040] bg-[#262626] shadow-sm'

const emptyEditor = {
  id: null,
  patientId: '',
  status: 'draft',
  exam: '',
  requestedBy: '',
  cidCode: '',
  diagnosis: '',
  conclusion: '',
  contentHtml: '',
  contentJson: undefined,
  hideDate: false,
  hideSignature: false,
  dueAt: '',
}

export function ReportsPage() {
  const [reports, setReports] = useState([])
  const [patients, setPatients] = useState([])
  const [professionals, setProfessionals] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [filterPatientId, setFilterPatientId] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCreatedBy, setFilterCreatedBy] = useState('')
  const [filterOrder, setFilterOrder] = useState('created_at.desc')

  const [editorOpen, setEditorOpen] = useState(false)
  const [viewerReport, setViewerReport] = useState(null)
  const [editor, setEditor] = useState(emptyEditor)
  const [page, setPage] = useState(1)

  const patientOptions = useMemo(
    () =>
      patients.map((patient) => ({
        id: String(patient.id || ''),
        name: patient.name || patient.full_name || patient.nome || 'Paciente',
      })),
    [patients],
  )

  const professionalOptions = useMemo(() => {
    const seen = new Set()

    return professionals
      .map((professional) => {
        const createdByValue = String(professional.userId || professional.id || '')
        return {
          id: String(professional.id || ''),
          createdByValue,
          name: professional.name || 'Medico(a)',
        }
      })
      .filter((professional) => {
        if (!professional.createdByValue || seen.has(professional.createdByValue)) {
          return false
        }

        seen.add(professional.createdByValue)
        return true
      })
  }, [professionals])

  const patientNameById = useMemo(
    () => Object.fromEntries(patientOptions.map((patient) => [patient.id, patient.name])),
    [patientOptions],
  )

  const professionalNameByCreatedBy = useMemo(
    () => Object.fromEntries(professionalOptions.map((professional) => [professional.createdByValue, professional.name])),
    [professionalOptions],
  )

  const enrichedReports = useMemo(
    () =>
      reports.map((report) => ({
        ...report,
        patientName: patientNameById[String(report.patientId || '')] || 'Paciente nao encontrado',
        createdByName: professionalNameByCreatedBy[String(report.createdBy || '')] || report.createdBy || 'Sistema',
      })),
    [patientNameById, professionalNameByCreatedBy, reports],
  )

  const stats = useMemo(
    () => [
      { label: 'Total', value: enrichedReports.length, className: 'text-[#e5e5e5]' },
      {
        label: 'Rascunhos',
        value: enrichedReports.filter((report) => report.status === 'draft').length,
        className: statusConfig.draft.stat,
      },
    ],
    [enrichedReports],
  )

  const totalPages = Math.max(1, Math.ceil(enrichedReports.length / ITEMS_PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedReports = enrichedReports.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const loadReports = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await reportRepository.getInitialReports({
        patientId: filterPatientId || undefined,
        status: filterStatus || undefined,
        createdBy: filterCreatedBy || undefined,
        order: filterOrder,
      })

      setReports(data)
      setPage(1)
    } catch (loadError) {
      console.error(loadError)
      setError(loadError.message || 'Erro ao carregar relatorios medicos.')
      setReports([])
      setPage(1)
    } finally {
      setLoading(false)
    }
  }, [filterCreatedBy, filterOrder, filterPatientId, filterStatus])

  useEffect(() => {
    let active = true

    Promise.all([
      patientRepository.getAll(),
      professionalRepository.getAll(),
    ])
      .then(([patientData, professionalData]) => {
        if (!active) return
        setPatients(patientData || [])
        setProfessionals(professionalData || [])
      })
      .catch((loadError) => {
        if (!active) return
        console.error(loadError)
        setError(loadError.message || 'Erro ao carregar dados auxiliares.')
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  function openNew() {
    setEditor({
      ...emptyEditor,
      patientId: patientOptions[0]?.id || '',
    })
    setEditorOpen(true)
  }

  function openEdit(report) {
    setEditor({
      id: report.id,
      patientId: String(report.patientId || ''),
      status: report.status,
      exam: report.exam,
      requestedBy: report.requestedBy,
      cidCode: report.cidCode,
      diagnosis: report.diagnosis,
      conclusion: report.conclusion,
      contentHtml: report.contentHtml,
      contentJson: report.contentJson,
      hideDate: report.hideDate,
      hideSignature: report.hideSignature,
      dueAt: toDateTimeLocal(report.dueAt),
    })
    setEditorOpen(true)
  }

  async function handleSave() {
    if (!editor.patientId) return

    setSaving(true)

    const payload = {
      patientId: editor.patientId,
      status: editor.status,
      exam: editor.exam,
      requestedBy: editor.requestedBy,
      cidCode: editor.cidCode,
      diagnosis: editor.diagnosis,
      conclusion: editor.conclusion,
      contentHtml: editor.contentHtml,
      contentJson: editor.contentJson,
      hideDate: editor.hideDate,
      hideSignature: editor.hideSignature,
      dueAt: editor.dueAt ? new Date(editor.dueAt).toISOString() : '',
    }

    try {
      if (editor.id) {
        await reportRepository.update(editor.id, payload)
      } else {
        await reportRepository.create(payload)
      }

      setEditorOpen(false)
      await loadReports()
    } catch (saveError) {
      alert(saveError.message || 'Erro ao salvar relatorio medico.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 text-[#e5e5e5]">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#e5e5e5]">Relatorios medicos</h1>
          <p className="mt-1 text-sm text-[#a3a3a3]">Consulta, criacao e edicao de relatorios medicos.</p>
        </div>
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#3b82f6] px-4 text-sm font-medium text-white transition hover:bg-[#2563eb]"
          onClick={openNew}
          type="button"
        >
          <ReportIcon name="plus" />
          Novo relatorio
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div className={cardClass} key={stat.label}>
            <div className="p-4">
              <p className="text-xs font-semibold text-[#a3a3a3]">{stat.label}</p>
              <p className={`mt-1 text-2xl font-bold ${stat.className}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </section>

      <section className={`${cardClass} p-6`}>
        <div className="mb-6 grid gap-4 lg:grid-cols-4">
          <FilterField label="Paciente">
            <select
              className={inputClass}
              onChange={(event) => {
                setFilterPatientId(event.target.value)
                setPage(1)
              }}
              value={filterPatientId}
            >
              <option value="">Todos os pacientes</option>
              {patientOptions.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Status">
            <select
              className={inputClass}
              onChange={(event) => {
                setFilterStatus(event.target.value)
                setPage(1)
              }}
              value={filterStatus}
            >
              <option value="">Todos os status</option>
              <option value="draft">Rascunho</option>
            </select>
          </FilterField>

          <FilterField label="Criado por">
            <select
              className={inputClass}
              onChange={(event) => {
                setFilterCreatedBy(event.target.value)
                setPage(1)
              }}
              value={filterCreatedBy}
            >
              <option value="">Todos os autores</option>
              {professionalOptions.map((professional) => (
                <option key={professional.createdByValue} value={professional.createdByValue}>
                  {professional.name}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Ordenacao">
            <select
              className={inputClass}
              onChange={(event) => {
                setFilterOrder(event.target.value)
                setPage(1)
              }}
              value={filterOrder}
            >
              {orderOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FilterField>
        </div>

        {error ? (
          <div className="mb-6 rounded-xl border border-[#7f1d1d] bg-[#2a1111] px-4 py-3 text-sm text-[#fecaca]">
            {error}
          </div>
        ) : null}

        <div className="overflow-x-auto rounded-xl border border-[#404040]">
          <table className="w-full min-w-full table-fixed text-left text-sm">
            <thead className="bg-[#171717] text-xs font-semibold uppercase text-[#a3a3a3]">
              <tr>
                <th className="w-[12%] px-4 py-3">Numero</th>
                <th className="w-[20%] px-4 py-3">Exame</th>
                <th className="w-[18%] px-4 py-3">Paciente</th>
                <th className="w-[18%] px-4 py-3">Solicitante</th>
                <th className="w-[14%] px-4 py-3">Criado em</th>
                <th className="w-[10%] px-4 py-3">Status</th>
                <th className="sticky right-0 w-[8.5rem] bg-[#171717] px-4 py-3 text-right">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#404040] bg-[#262626]">
              {loading ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-[#a3a3a3]" colSpan={7}>
                    Carregando relatorios medicos...
                  </td>
                </tr>
              ) : paginatedReports.length ? (
                paginatedReports.map((report) => (
                  <ReportRow
                    key={report.id}
                    onEdit={() => openEdit(report)}
                    onView={() => setViewerReport(report)}
                    report={report}
                  />
                ))
              ) : (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-[#a3a3a3]" colSpan={7}>
                    Nenhum relatorio encontrado com os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col gap-4 border-t border-[#404040] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#a3a3a3]">
            Mostrando {enrichedReports.length ? startIndex + 1 : 0}-{Math.min(startIndex + ITEMS_PER_PAGE, enrichedReports.length)} de{' '}
            {enrichedReports.length} relatorios
          </p>
          <div className="flex items-center gap-2">
            <PageButton disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
              <ReportIcon className="size-4" name="chevron-left" />
            </PageButton>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                className={`grid size-8 place-items-center rounded-lg text-xs font-medium transition ${
                  pageNumber === currentPage
                    ? 'bg-[#3b82f6] text-white'
                    : 'border border-[#404040] bg-[#1a1a1a] text-[#a3a3a3] hover:bg-[#333333]'
                }`}
                key={pageNumber}
                onClick={() => setPage(pageNumber)}
                type="button"
              >
                {pageNumber}
              </button>
            ))}
            <PageButton disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>
              <ReportIcon className="size-4" name="chevron-right" />
            </PageButton>
          </div>
        </div>
      </section>

      {editorOpen ? (
        <ReportEditorModal
          editor={editor}
          onChange={setEditor}
          onClose={() => setEditorOpen(false)}
          onSave={handleSave}
          patientOptions={patientOptions}
          professionalOptions={professionalOptions}
          saving={saving}
        />
      ) : null}

      {viewerReport ? (
        <ReportViewModal onClose={() => setViewerReport(null)} report={viewerReport} />
      ) : null}
    </div>
  )
}

function ReportRow({ onEdit, onView, report }) {
  return (
    <tr className="transition hover:bg-[#303030]">
      <td className="px-4 py-3 align-top text-[#a3a3a3]">{report.orderNumber || '-'}</td>
      <td className="px-4 py-3 align-top">
        <div className="flex items-center gap-2">
          <ReportIcon className="mt-0.5 size-4 shrink-0 text-[#3b82f6]" name="file" />
          <span className="whitespace-normal break-words font-medium text-[#e5e5e5]">{report.exam || 'Sem exame'}</span>
        </div>
      </td>
      <td className="px-4 py-3 align-top whitespace-normal break-words text-[#e5e5e5]">{report.patientName}</td>
      <td className="px-4 py-3 align-top whitespace-normal break-words text-[#a3a3a3]">{report.requestedBy || '-'}</td>
      <td className="px-4 py-3 align-top text-[#a3a3a3]">{formatDate(report.createdAt)}</td>
      <td className="px-4 py-3 align-top">
        <span className={`rounded px-2 py-1 text-[10px] font-bold ${statusConfig[report.status].pill}`}>
          {statusConfig[report.status].label}
        </span>
      </td>
      <td className="sticky right-0 bg-[#262626] px-4 py-3 text-right shadow-[-10px_0_12px_-12px_rgba(0,0,0,0.75)]">
        <div className="flex justify-end gap-2">
          <IconButton label="Visualizar" name="eye" onClick={onView} />
          <IconButton label="Editar" name="edit" onClick={onEdit} />
        </div>
      </td>
    </tr>
  )
}

function ReportEditorModal({ editor, onChange, onClose, onSave, patientOptions, professionalOptions, saving }) {
  const isValid = Boolean(editor.patientId)

  function updateField(field, value) {
    onChange((current) => ({ ...current, [field]: value }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border border-[#404040] bg-[#262626] shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#404040] px-6 py-4">
          <h2 className="text-lg font-bold text-[#e5e5e5]">
            {editor.id ? 'Editar relatorio medico' : 'Novo relatorio medico'}
          </h2>
          <button className="rounded-lg p-1.5 transition hover:bg-[#2a2a2a]" onClick={onClose} type="button">
            <ReportIcon className="size-4 text-[#a3a3a3]" name="x" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <DarkField label="Paciente *">
                <select className={inputClass} onChange={(event) => updateField('patientId', event.target.value)} value={editor.patientId}>
                  <option value="">Selecione um paciente</option>
                  {patientOptions.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
              </DarkField>

              <DarkField label="Status">
                <select className={inputClass} onChange={(event) => updateField('status', event.target.value)} value={editor.status}>
                  <option value="draft">Rascunho</option>
                </select>
              </DarkField>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <DarkField label="Exame">
                <input
                  className={inputClass}
                  onChange={(event) => updateField('exam', event.target.value)}
                  placeholder="Nome do exame"
                  value={editor.exam}
                />
              </DarkField>

              <DarkField label="Solicitante">
                <div>
                  <input
                    className={inputClass}
                    list="report-requested-by-suggestions"
                    onChange={(event) => updateField('requestedBy', event.target.value)}
                    placeholder="Nome do solicitante"
                    value={editor.requestedBy}
                  />
                  <datalist id="report-requested-by-suggestions">
                    {professionalOptions.map((professional) => (
                      <option key={professional.id} value={professional.name} />
                    ))}
                  </datalist>
                </div>
              </DarkField>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <DarkField label="CID-10">
                <input
                  className={inputClass}
                  onChange={(event) => updateField('cidCode', event.target.value)}
                  placeholder="Ex: Z01.7"
                  value={editor.cidCode}
                />
              </DarkField>

              <DarkField label="Prazo">
                <input
                  className={`${inputClass} [color-scheme:dark]`}
                  onChange={(event) => updateField('dueAt', event.target.value)}
                  type="datetime-local"
                  value={editor.dueAt}
                />
              </DarkField>
            </div>

            <DarkField label="Diagnostico">
              <textarea
                className={textareaClass}
                onChange={(event) => updateField('diagnosis', event.target.value)}
                placeholder="Diagnostico do relatorio"
                value={editor.diagnosis}
              />
            </DarkField>

            <DarkField label="Conclusao">
              <textarea
                className={textareaClass}
                onChange={(event) => updateField('conclusion', event.target.value)}
                placeholder="Conclusao do relatorio"
                value={editor.conclusion}
              />
            </DarkField>

            <DarkField label="Conteudo HTML">
              <textarea
                className={`${textareaClass} min-h-72`}
                onChange={(event) => updateField('contentHtml', event.target.value)}
                placeholder="<p>Conteudo do relatorio</p>"
                value={editor.contentHtml}
              />
            </DarkField>

            <div className="flex flex-wrap items-center gap-6">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-[#e5e5e5]">
                <input
                  checked={editor.hideDate}
                  className="size-4 accent-[#3b82f6]"
                  onChange={(event) => updateField('hideDate', event.target.checked)}
                  type="checkbox"
                />
                Ocultar data
              </label>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-[#e5e5e5]">
                <input
                  checked={editor.hideSignature}
                  className="size-4 accent-[#3b82f6]"
                  onChange={(event) => updateField('hideSignature', event.target.checked)}
                  type="checkbox"
                />
                Ocultar assinatura
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#404040] px-6 py-4">
          <button
            className="rounded-lg border border-[#404040] bg-[#262626] px-4 py-2 text-sm font-medium text-[#e5e5e5] transition hover:bg-[#2a2a2a]"
            onClick={onClose}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!isValid || saving}
            onClick={onSave}
            type="button"
          >
            <ReportIcon className="size-3.5" name="save" />
            {saving ? 'Salvando...' : 'Salvar relatorio'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ReportViewModal({ onClose, report }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border border-[#404040] bg-[#262626] shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#404040] px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-[#e5e5e5]">Relatorio medico</h2>
            <p className="mt-1 text-xs text-[#a3a3a3]">{report.orderNumber || 'Sem numero'} </p>
          </div>
          <button className="rounded-lg p-1.5 transition hover:bg-[#2a2a2a]" onClick={onClose} type="button">
            <ReportIcon className="size-4 text-[#a3a3a3]" name="x" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <DetailCard label="Paciente" value={report.patientName} />
            <DetailCard label="Solicitante" value={report.requestedBy || '-'} />
            <DetailCard label="Criado em" value={formatDate(report.createdAt)} />
            <DetailCard label="Criado por" value={report.createdByName} />
            <DetailCard label="Status" value={statusConfig[report.status].label} />
            <DetailCard label="Prazo" value={formatDateTime(report.dueAt)} />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <DetailBlock label="Exame" value={report.exam || '-'} />
            <DetailBlock label="CID-10" value={report.cidCode || '-'} />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <DetailBlock label="Diagnostico" value={report.diagnosis || '-'} />
            <DetailBlock label="Conclusao" value={report.conclusion || '-'} />
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#a3a3a3]">
            <span className="rounded-full border border-[#404040] px-3 py-1">
              {report.hideDate ? 'Data oculta' : 'Data visivel'}
            </span>
            <span className="rounded-full border border-[#404040] px-3 py-1">
              {report.hideSignature ? 'Assinatura oculta' : 'Assinatura visivel'}
            </span>
          </div>

          <div className="mt-6 rounded-xl border border-[#404040] bg-[#1a1a1a] p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#a3a3a3]">Conteudo HTML</p>
            {report.contentHtml ? (
              <div
                className="prose prose-invert max-w-none text-sm text-[#e5e5e5]"
                dangerouslySetInnerHTML={{ __html: report.contentHtml }}
              />
            ) : (
              <p className="text-sm text-[#a3a3a3]">Nenhum conteudo HTML informado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterField({ children, label }) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  )
}

function DarkField({ children, label }) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  )
}

function DetailCard({ label, value }) {
  return (
    <div className="rounded-xl border border-[#404040] bg-[#1a1a1a] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#a3a3a3]">{label}</p>
      <p className="mt-2 text-sm text-[#e5e5e5]">{value}</p>
    </div>
  )
}

function DetailBlock({ label, value }) {
  return (
    <div className="rounded-xl border border-[#404040] bg-[#1a1a1a] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#a3a3a3]">{label}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#e5e5e5]">{value}</p>
    </div>
  )
}

function IconButton({ label, name, onClick }) {
  return (
    <button
      aria-label={label}
      className="grid size-9 place-items-center rounded-lg border border-[#404040] bg-[#1a1a1a] text-[#a3a3a3] transition hover:bg-[#2a2a2a] hover:text-[#e5e5e5]"
      onClick={onClick}
      title={label}
      type="button"
    >
      <ReportIcon className="size-4" name={name} />
    </button>
  )
}

function PageButton({ children, disabled, onClick }) {
  return (
    <button
      className="grid size-8 place-items-center rounded-lg border border-[#404040] bg-[#1a1a1a] text-[#e5e5e5] transition hover:bg-[#333333] disabled:cursor-not-allowed disabled:opacity-30"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}

function formatDate(value) {
  if (!value) return '-'

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '-'

  return parsed.toLocaleDateString('pt-BR')
}

function formatDateTime(value) {
  if (!value) return '-'

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '-'

  return parsed.toLocaleString('pt-BR')
}

function toDateTimeLocal(value) {
  if (!value) return ''

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''

  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const day = String(parsed.getDate()).padStart(2, '0')
  const hours = String(parsed.getHours()).padStart(2, '0')
  const minutes = String(parsed.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function ReportIcon({ className = 'size-4', name }) {
  const common = {
    className,
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: 1.8,
    viewBox: '0 0 24 24',
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

  if (name === 'x') {
    return (
      <svg {...common}>
        <path d="M18 6 6 18M6 6l12 12" />
      </svg>
    )
  }

  if (name === 'chevron-left') {
    return (
      <svg {...common}>
        <path d="m15 18-6-6 6-6" />
      </svg>
    )
  }

  if (name === 'chevron-right') {
    return (
      <svg {...common}>
        <path d="m9 18 6-6-6-6" />
      </svg>
    )
  }

  if (name === 'save') {
    return (
      <svg {...common}>
        <path d="M5 21h14a1 1 0 0 0 1-1V7.4a1 1 0 0 0-.3-.7l-2.4-2.4a1 1 0 0 0-.7-.3H5a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1Z" />
        <path d="M8 21v-6h8v6M8 4v5h7" />
      </svg>
    )
  }

  return (
    <svg {...common}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}
