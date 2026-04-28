import { apiConfig, getAuthenticatedHeaders } from '../config/api.js'

export const professionalRepository = {
  async getAll() {
    const response = await fetch(`${apiConfig.restUrl}/doctors`, {
      headers: getAuthenticatedHeaders()
    })
    
    if (!response.ok) throw new Error('Erro ao buscar medicos.')
    
    const data = await response.json()
    return (Array.isArray(data) ? data : []).map(mapProfessional)
  },

  getCoverageMap() {
    return {
      slots: ['08-12', '09-13', '10-15', '13-18', '08-14'],
      weekdays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
    }
  },
}

function mapProfessional(doctor) {
  return {
    id: String(doctor.id || doctor.medico_id || doctor.user_id || doctor.name || doctor.nome),
    userId: doctor.user_id || doctor.userId || doctor.usuario_id || doctor.auth_user_id || null,
    name: doctor.name || doctor.nome || doctor.full_name || 'Medico(a)',
    email: doctor.email || doctor.user_email || doctor.usuario_email || '',
    role: doctor.specialty || doctor.speciality || doctor.especialidade || doctor.role || 'Medico(a)',
    schedule: doctor.schedule || doctor.agenda || doctor.disponibilidade || 'Seg a Sex, 08h as 18h',
    nextSlot: doctor.nextSlot || doctor.proximo_horario || doctor.next_slot || 'Consulta pendente',
    patients: doctor.patients || doctor.pacientes_ativos || doctor.active_patients || 0,
    status: doctor.status || doctor.situacao || 'Disponivel',
  }
}
