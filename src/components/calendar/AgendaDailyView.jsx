import React from 'react'
import { format, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { sortAppointmentsByTime } from '../../utils/agendaDate.js'

export function AgendaDailyView({ baseDate, appointments, onAppointmentClick }) {
  const dailyAppointments = sortAppointmentsByTime(appointments)

  return (
    <div className="rounded-2xl border border-[#404040] bg-[#262626] p-5">
      <div className="flex flex-col gap-3 border-b border-[#404040] pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#737373]">
            Vista ampliada do dia
          </span>
          <h3 className="mt-2 text-xl font-bold text-[#e5e5e5]">
            {format(baseDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-[#404040] bg-[#1f1f1f] px-3 py-1 text-xs font-semibold text-[#a3a3a3]">
            {dailyAppointments.length} {dailyAppointments.length === 1 ? 'agendamento' : 'agendamentos'}
          </span>
          {isToday(baseDate) && (
            <span className="rounded-full border border-[#3b82f6]/30 bg-[#3b82f6]/10 px-3 py-1 text-xs font-semibold text-[#93c5fd]">
              Hoje
            </span>
          )}
        </div>
      </div>

      {dailyAppointments.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-[#404040] bg-[#1f1f1f] p-8 text-center">
          <h3 className="text-base font-bold text-[#e5e5e5]">Nenhum horário encontrado</h3>
          <p className="mt-2 text-sm leading-6 text-[#a3a3a3]">
            Ajuste o filtro ou altere o período no calendário.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          {dailyAppointments.map((appointment) => (
            <article
              key={appointment.id}
              className={`grid gap-4 rounded-xl border p-4 md:grid-cols-[96px_1fr_auto] ${getStatusColors(appointment.status)}`}
            >
              <div>
                <p className="text-2xl font-bold leading-none">{appointment.time || '--:--'}</p>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] opacity-80">
                  {appointment.mode}
                </p>
              </div>

              <div>
                <button
                  className="text-left text-base font-bold transition hover:opacity-85"
                  onClick={() => onAppointmentClick && onAppointmentClick(appointment)}
                  type="button"
                >
                  {appointment.patient}
                </button>
                <p className="mt-1 text-sm opacity-90">
                  {appointment.type} com {appointment.professional}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium opacity-80">
                  <span className="rounded-full bg-black/15 px-2.5 py-1">{appointment.room}</span>
                  <span className="rounded-full bg-black/15 px-2.5 py-1">{appointment.type}</span>
                </div>
              </div>

              <div className="flex items-start justify-start md:justify-end">
                <span className="rounded-full border border-current/20 bg-black/10 px-3 py-1 text-xs font-bold">
                  {appointment.status}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

function getStatusColors(status) {
  switch (status) {
    case 'Confirmada':
      return 'border-[#14532d] bg-[#052e1a] text-[#a7f3d0]'
    case 'Em triagem':
      return 'border-[#78350f] bg-[#2d1e05] text-[#fde68a]'
    case 'Concluida':
    case 'Concluída':
      return 'border-[#1e3a8a] bg-[#172554] text-[#bfdbfe]'
    case 'Cancelada':
      return 'border-[#7f1d1d] bg-[#450a0a] text-[#fecaca]'
    case 'Aguardando':
    default:
      return 'border-[#404040] bg-[#1f1f1f] text-[#e5e5e5]'
  }
}
