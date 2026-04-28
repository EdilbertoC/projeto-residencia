import {
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  endOfWeek,
  format,
  startOfWeek,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { AgendaDailyView } from '../components/calendar/AgendaDailyView.jsx'
import { AgendaWeeklyView } from '../components/calendar/AgendaWeeklyView.jsx'
import { AgendaMonthlyView } from '../components/calendar/AgendaMonthlyView.jsx'
import { useAgenda } from '../hooks/useAgenda.js'

const statusFilters = [
  { label: 'Todos', value: 'Todos' },
  { label: 'Confirmadas', value: 'Confirmada' },
  { label: 'Em triagem', value: 'Em triagem' },
  { label: 'Aguardando', value: 'Aguardando' },
]

const viewFilters = [
  { label: 'Dia', value: 'Dia' },
  { label: 'Semana', value: 'Semana' },
  { label: 'Mês', value: 'Mes' },
]

export function AgendaPage({ navigate }) {
  const {
    patients,
    professionals,
    currentProfessional,
    viewerProfile,
    agendaScope,
    loading,
    error,
    canCreateAppointment,
    activeView,
    setActiveView,
    baseDate,
    setBaseDate,
    status,
    setStatus,
    modalOpen,
    setModalOpen,
    form,
    updateForm,
    handleCreate,
    visibleAppointments,
  } = useAgenda()

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-[#a3a3a3]">
        <p>Carregando agenda...</p>
      </div>
    )
  }

  const weekStart = startOfWeek(baseDate, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(baseDate, { weekStartsOn: 0 })
  const isDoctorScope = agendaScope === 'doctor'

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-8 text-[#e5e5e5]">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[32px] font-bold leading-8 tracking-[-0.02em] text-[#e5e5e5]">
            Agenda
          </h1>
          <p className="mt-2 text-sm leading-5 text-[#a3a3a3]">
            {isDoctorScope
              ? `Agenda restrita ao médico logado: ${currentProfessional?.name || viewerProfile?.name || 'Médico atual'}.`
              : 'Visualização completa da agenda com todos os médicos.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-sm border border-[#404040] bg-[#262626] p-1">
            <button
              className="grid size-7 place-items-center rounded-sm text-[#a3a3a3] transition hover:bg-[#303030] hover:text-[#e5e5e5]"
              onClick={() => {
                if (activeView === 'Dia') setBaseDate((current) => subDays(current, 1))
                if (activeView === 'Semana') setBaseDate((current) => subWeeks(current, 1))
                if (activeView === 'Mes') setBaseDate((current) => subMonths(current, 1))
              }}
              type="button"
            >
              {'<'}
            </button>
            <span className="min-w-[160px] text-center text-sm font-semibold text-[#e5e5e5] capitalize">
              {activeView === 'Dia' && format(baseDate, "dd 'de' MMM", { locale: ptBR })}
              {activeView === 'Semana' &&
                `${format(weekStart, 'dd MMM', { locale: ptBR })} - ${format(weekEnd, 'dd MMM', { locale: ptBR })}`}
              {activeView === 'Mes' && format(baseDate, 'MMMM yyyy', { locale: ptBR })}
            </span>
            <button
              className="grid size-7 place-items-center rounded-sm text-[#a3a3a3] transition hover:bg-[#303030] hover:text-[#e5e5e5]"
              onClick={() => {
                if (activeView === 'Dia') setBaseDate((current) => addDays(current, 1))
                if (activeView === 'Semana') setBaseDate((current) => addWeeks(current, 1))
                if (activeView === 'Mes') setBaseDate((current) => addMonths(current, 1))
              }}
              type="button"
            >
              {'>'}
            </button>
          </div>
          <button
            className="h-9 rounded-sm border border-[#404040] bg-[#262626] px-4 text-sm font-medium text-[#e5e5e5] transition hover:bg-[#303030]"
            onClick={() => setBaseDate(new Date())}
            type="button"
          >
            Hoje
          </button>
          <button
            className="h-9 rounded-sm border border-[#3b82f6] bg-[#3b82f6] px-4 text-sm font-semibold text-white shadow-[0_10px_15px_rgba(59,130,246,0.16)] transition hover:bg-[#3478ed] disabled:cursor-not-allowed disabled:border-[#404040] disabled:bg-[#303030] disabled:text-[#737373] disabled:shadow-none"
            disabled={!canCreateAppointment}
            onClick={() => setModalOpen(true)}
            type="button"
          >
            + Nova consulta
          </button>
        </div>
      </section>

      {error ? (
        <section className="rounded-2xl border border-[#404040] bg-[#262626] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
          <div className="rounded-xl border border-dashed border-[#7f1d1d] bg-[#2a1111] p-6">
            <h2 className="text-base font-bold text-[#fecaca]">Nao foi possivel liberar a agenda</h2>
            <p className="mt-2 text-sm leading-6 text-[#fca5a5]">{error}</p>
            <p className="mt-3 text-sm leading-6 text-[#a3a3a3]">
              Enquanto esse vinculo nao existir na API, a tela fica bloqueada para evitar exibir consultas de outro medico.
            </p>
          </div>
        </section>
      ) : (
        <section className="grid gap-6 xl:grid-cols-1">
          <div className="rounded-2xl border border-[#404040] bg-[#262626] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-bold leading-6 text-[#e5e5e5]">
                    {format(baseDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                  </h2>
                </div>
                <p className="mt-1 text-sm leading-5 text-[#a3a3a3]">
                  Visualização: {activeView.toLowerCase()} | {visibleAppointments.length} registros visíveis
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {viewFilters.map((view) => (
                  <button
                    className={`h-8 rounded-sm border px-3 text-sm font-semibold transition ${
                      activeView === view.value
                        ? 'border-[#3b82f6] bg-[#3b82f6] text-white'
                        : 'border-[#404040] bg-[#303030] text-[#a3a3a3] hover:text-[#e5e5e5]'
                    }`}
                    key={view.value}
                    onClick={() => setActiveView(view.value)}
                    type="button"
                  >
                    {view.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {statusFilters.map((filter) => (
                <button
                  className={`h-8 rounded-sm border px-3 text-sm font-semibold transition ${
                    status === filter.value
                      ? 'border-[#3b82f6] bg-[#3b82f6]/10 text-[#3b82f6]'
                      : 'border-[#404040] bg-[#303030] text-[#a3a3a3] hover:text-[#e5e5e5]'
                  }`}
                  key={filter.value}
                  onClick={() => setStatus(filter.value)}
                  type="button"
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {!isDoctorScope && (
              <div className="mt-4 rounded-xl border border-[#404040] bg-[#1f1f1f] px-4 py-3 text-sm text-[#a3a3a3]">
                Perfil atual: {viewerProfile?.role || 'Administrador'} | agendamentos exibidos para todos os profissionais.
              </div>
            )}

            <div className="mt-6 grid gap-3">
              {activeView === 'Semana' && (
                <AgendaWeeklyView
                  baseDate={baseDate}
                  appointments={visibleAppointments}
                  onAppointmentClick={(appointment) => navigate(`/pacientes/${appointment.patientId}`)}
                />
              )}

              {activeView === 'Mes' && (
                <AgendaMonthlyView
                  baseDate={baseDate}
                  appointments={visibleAppointments}
                  onDayClick={(day) => {
                    setBaseDate(day)
                    setActiveView('Dia')
                  }}
                />
              )}

              {activeView === 'Dia' && (
                <AgendaDailyView
                  baseDate={baseDate}
                  appointments={visibleAppointments}
                  onAppointmentClick={(appointment) => navigate(`/pacientes/${appointment.patientId}`)}
                />
              )}
            </div>
          </div>
        </section>
      )}

      <DarkModal onClose={() => setModalOpen(false)} open={modalOpen} title="Nova consulta">
        <form className="grid gap-4" onSubmit={handleCreate}>
          <DarkField label="Paciente">
            <select
              className="h-11 rounded-md border border-[#404040] bg-[#303030] px-3 text-sm text-[#e5e5e5] outline-none focus:border-[#3b82f6]"
              onChange={(event) => updateForm('patientId', event.target.value)}
              value={form.patientId}
            >
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name || patient.full_name || patient.nome}
                </option>
              ))}
            </select>
          </DarkField>

          <div className="grid gap-4 sm:grid-cols-2">
            <DarkField label="Horário">
              <input
                className="h-11 rounded-md border border-[#404040] bg-[#303030] px-3 text-sm text-[#e5e5e5] outline-none focus:border-[#3b82f6]"
                onChange={(event) => updateForm('time', event.target.value)}
                type="time"
                value={form.time}
              />
            </DarkField>
            <DarkField label="Formato">
              <select
                className="h-11 rounded-md border border-[#404040] bg-[#303030] px-3 text-sm text-[#e5e5e5] outline-none focus:border-[#3b82f6]"
                onChange={(event) => updateForm('mode', event.target.value)}
                value={form.mode}
              >
                <option>Teleconsulta</option>
                <option>Presencial</option>
              </select>
            </DarkField>
          </div>

          <DarkField label="Profissional">
            {isDoctorScope ? (
              <input
                className="h-11 rounded-md border border-[#404040] bg-[#262626] px-3 text-sm text-[#a3a3a3] outline-none"
                disabled
                readOnly
                value={currentProfessional?.name || 'Médico não vinculado'}
              />
            ) : (
              <select
                className="h-11 rounded-md border border-[#404040] bg-[#303030] px-3 text-sm text-[#e5e5e5] outline-none focus:border-[#3b82f6]"
                onChange={(event) => updateForm('professionalId', event.target.value)}
                value={form.professionalId}
              >
                {professionals.map((professional) => (
                  <option key={professional.id} value={professional.id}>
                    {professional.name}
                  </option>
                ))}
              </select>
            )}
          </DarkField>

          <DarkField label="Tipo de consulta">
            <input
              className="h-11 rounded-md border border-[#404040] bg-[#303030] px-3 text-sm text-[#e5e5e5] outline-none focus:border-[#3b82f6]"
              onChange={(event) => updateForm('type', event.target.value)}
              value={form.type}
            />
          </DarkField>

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button
              className="h-10 rounded-sm border border-[#404040] bg-[#303030] px-4 text-sm font-semibold text-[#e5e5e5] transition hover:bg-[#333333]"
              onClick={() => setModalOpen(false)}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="h-10 rounded-sm border border-[#3b82f6] bg-[#3b82f6] px-4 text-sm font-semibold text-white transition hover:bg-[#3478ed] disabled:cursor-not-allowed disabled:border-[#404040] disabled:bg-[#303030] disabled:text-[#737373]"
              disabled={!canCreateAppointment}
              type="submit"
            >
              Salvar consulta
            </button>
          </div>
        </form>
      </DarkModal>
    </div>
  )
}

function DarkField({ children, label }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[#a3a3a3]">
      <span>{label}</span>
      {children}
    </label>
  )
}

function DarkModal({ children, onClose, open, title }) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <div className="w-full max-w-xl rounded-2xl border border-[#404040] bg-[#262626] shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-[#404040] px-5 py-4">
          <h2 className="text-lg font-bold text-[#e5e5e5]">{title}</h2>
          <button
            aria-label="Fechar"
            className="grid size-8 place-items-center rounded-sm text-xl leading-none text-[#a3a3a3] transition hover:bg-[#303030] hover:text-[#e5e5e5]"
            onClick={onClose}
            type="button"
          >
            x
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
