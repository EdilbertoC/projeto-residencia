import React from 'react'
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { parseLocalDate, sortAppointmentsByTime } from '../../utils/agendaDate.js'

export function AgendaWeeklyView({ baseDate, appointments, onAppointmentClick }) {
  const start = startOfWeek(baseDate, { weekStartsOn: 0 })
  const end = endOfWeek(baseDate, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start, end })

  const weeklyAppointments = sortAppointmentsByTime(
    appointments.filter((appointment) => {
      if (!appointment.date) return false

      const appointmentDate = parseLocalDate(appointment.date)
      return appointmentDate && appointmentDate >= start && appointmentDate <= end
    }),
  )

  return (
    <div className="rounded-2xl border border-[#404040] bg-[#262626] p-5">
      <div className="grid grid-cols-7 gap-4 border-b border-[#404040] pb-4">
        {days.map((day) => {
          const isWeekend = day.getDay() === 0

          return (
            <div key={day.toISOString()} className="text-center">
              <span
                className={`block text-xs font-semibold uppercase tracking-[0.16em] ${
                  isWeekend ? 'text-[#93c5fd]' : 'text-[#a3a3a3]'
                }`}
              >
                {format(day, 'EEE', { locale: ptBR })}
              </span>
              <span className={`mt-1 block text-2xl font-bold ${isToday(day) ? 'text-[#3b82f6]' : 'text-[#e5e5e5]'}`}>
                {format(day, 'dd')}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-4 grid min-h-[400px] grid-cols-7 gap-4">
        {days.map((day) => {
          const dayAppointments = weeklyAppointments.filter((appointment) => {
            if (!appointment.date) return false

            const appointmentDate = parseLocalDate(appointment.date)
            return appointmentDate && isSameDay(appointmentDate, day)
          })

          return (
            <div
              key={day.toISOString()}
              className="flex h-full flex-col gap-2 rounded-lg border border-[#404040]/50 bg-[#1f1f1f] p-2"
            >
              {dayAppointments.length === 0 ? (
                <div className="flex h-full items-center justify-center p-4">
                  <span className="text-center text-xs text-[#737373]">Livre</span>
                </div>
              ) : (
                dayAppointments.map((appointment) => (
                  <button
                    key={appointment.id}
                    onClick={() => onAppointmentClick && onAppointmentClick(appointment)}
                    className={`flex w-full flex-col items-start rounded-md border p-2 text-left shadow-sm transition hover:brightness-110 ${getStatusColors(appointment.status)}`}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span className="rounded bg-black/20 px-1.5 py-0.5 text-xs font-bold leading-none">
                        {appointment.time}
                      </span>
                      <span className="truncate text-[10px] font-semibold uppercase tracking-wider opacity-80">
                        {appointment.mode}
                      </span>
                    </div>
                    <span className="w-full truncate text-xs font-bold leading-tight" title={appointment.patient}>
                      {appointment.patient}
                    </span>
                    <span
                      className="mt-0.5 w-full truncate text-[10px] font-medium opacity-80"
                      title={appointment.professional}
                    >
                      Dr(a). {appointment.professional?.split(' ')[0]}
                    </span>
                  </button>
                ))
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function getStatusColors(status) {
  switch (status) {
    case 'Confirmada':
      return 'border-[#14532d] bg-[#052e1a] text-[#10b981]'
    case 'Em triagem':
      return 'border-[#78350f] bg-[#2d1e05] text-[#f59e0b]'
    case 'Concluida':
    case 'Concluída':
      return 'border-[#1e3a8a] bg-[#172554] text-[#60a5fa]'
    case 'Aguardando':
      return 'border-[#404040] bg-[#303030] text-[#e5e5e5]'
    case 'Cancelada':
      return 'border-[#7f1d1d] bg-[#450a0a] text-[#f87171] opacity-75'
    case 'Bloqueado':
      return 'border-[#404040] bg-[#1f1f1f] text-[#737373]'
    default:
      return 'border-[#404040] bg-[#303030] text-[#e5e5e5]'
  }
}
