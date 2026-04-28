import { useState, useEffect, useMemo } from 'react'
import { isSameDay } from 'date-fns'

import { appointmentRepository } from '../repositories/appointmentRepository.js'
import { patientRepository } from '../repositories/patientRepository.js'
import { professionalRepository } from '../repositories/professionalRepository.js'
import { profileRepository } from '../repositories/profileRepository.js'
import { formatLocalDateInput, parseLocalDate, sortAppointmentsByTime } from '../utils/agendaDate.js'

export function useAgenda() {
  const [patients, setPatients] = useState([])
  const [professionals, setProfessionals] = useState([])
  const [currentProfessional, setCurrentProfessional] = useState(null)
  const [viewerProfile, setViewerProfile] = useState(null)
  const [localAppointments, setLocalAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [activeView, setActiveView] = useState('Dia')
  const [baseDate, setBaseDate] = useState(new Date())
  const [status, setStatus] = useState('Todos')
  const [modalOpen, setModalOpen] = useState(false)

  const [form, setForm] = useState({
    patientId: '',
    professionalId: '',
    type: 'Retorno',
    time: '15:30',
    mode: 'Teleconsulta',
  })

  useEffect(() => {
    let active = true

    async function loadAgendaContext() {
      try {
        setError('')

        const [patientsData, professionalsData, currentProfile] = await Promise.all([
          patientRepository.getAll(),
          professionalRepository.getAll(),
          profileRepository.getCurrentUserProfile(),
        ])

        if (!active) return

        const agendaScope = currentProfile?.isDoctor ? 'doctor' : 'global'
        const resolvedProfessional = resolveCurrentProfessional(currentProfile, professionalsData)
        const initialProfessionalId =
          agendaScope === 'doctor'
            ? resolvedProfessional?.id || ''
            : professionalsData?.[0]?.id || ''

        setViewerProfile(currentProfile)
        setPatients(patientsData || [])
        setCurrentProfessional(resolvedProfessional)
        setProfessionals(professionalsData || [])
        setForm((current) => ({
          ...current,
          patientId: patientsData?.length ? patientsData[0].id : '',
          professionalId: initialProfessionalId,
        }))

        if (agendaScope === 'doctor' && !resolvedProfessional) {
          setLocalAppointments([])
          setError('Nao foi possivel vincular o medico logado a um profissional da base.')
          return
        }

        const appointmentsData = await appointmentRepository.getAll({
          doctorId: agendaScope === 'doctor' ? resolvedProfessional?.id : undefined,
        })

        if (!active) return

        setLocalAppointments(
          agendaScope === 'doctor' && resolvedProfessional
            ? filterAppointmentsByProfessional(appointmentsData || [], resolvedProfessional.id)
            : sortAppointmentsByTime(appointmentsData || []),
        )
      } catch (loadError) {
        if (!active) return

        console.error(loadError)
        setError(loadError.message || 'Erro ao carregar agenda.')
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadAgendaContext()

    return () => {
      active = false
    }
  }, [])

  const visibleAppointments = useMemo(() => {
    let filtered = localAppointments

    if (status !== 'Todos') {
      filtered = filtered.filter((appointment) => appointment.status === status)
    }

    if (activeView === 'Dia') {
      filtered = filtered.filter((appointment) => {
        if (!appointment.date) return false

        const appointmentDate = parseLocalDate(appointment.date)
        if (!appointmentDate) return false

        return isSameDay(appointmentDate, baseDate)
      })
    }

    return sortAppointmentsByTime(filtered)
  }, [localAppointments, status, activeView, baseDate])

  const agendaScope = viewerProfile?.isDoctor ? 'doctor' : 'global'
  const canCreateAppointment = agendaScope === 'doctor'
    ? Boolean(currentProfessional?.id)
    : professionals.length > 0

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleCreate(event) {
    event.preventDefault()

    const targetProfessionalId = agendaScope === 'doctor'
      ? currentProfessional?.id
      : form.professionalId

    if (!targetProfessionalId) {
      alert('Nao foi possivel identificar o profissional da consulta.')
      return
    }

    const dateStr = formatLocalDateInput(baseDate)

    try {
      const created = await appointmentRepository.create({
        patientId: form.patientId,
        date: dateStr,
        time: form.time,
        type: form.type,
        mode: form.mode,
        room: form.mode === 'Teleconsulta' ? 'Virtual' : 'Consultório 1',
        professionalId: targetProfessionalId,
      })

      setLocalAppointments((current) => sortAppointmentsByTime([...current, created]))
      setModalOpen(false)
    } catch (createError) {
      alert(createError.message || 'Erro ao criar agendamento.')
    }
  }

  return {
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
  }
}

function resolveCurrentProfessional(profile, professionals) {
  const doctorId = normalizeValue(profile?.doctorId)
  const userId = normalizeValue(profile?.id)
  const email = normalizeValue(profile?.email)

  return (
    professionals.find((professional) => normalizeValue(professional.id) === doctorId) ||
    professionals.find((professional) => normalizeValue(professional.userId) === userId) ||
    professionals.find((professional) => normalizeValue(professional.id) === userId) ||
    professionals.find((professional) => normalizeValue(professional.email) === email) ||
    null
  )
}

function filterAppointmentsByProfessional(appointments, professionalId) {
  const normalizedProfessionalId = normalizeValue(professionalId)

  return sortAppointmentsByTime(
    appointments.filter((appointment) => normalizeValue(appointment.professionalId) === normalizedProfessionalId),
  )
}

function normalizeValue(value) {
  return String(value || '').trim().toLowerCase()
}
