import { apiConfig, getAuthenticatedHeaders } from '../config/api.js'
import { appointmentMapper } from '../mappers/appointmentMapper.js'

export const appointmentRepository = {
  async getAll({ doctorId } = {}) {
    const doctorFilter = doctorId ? `&doctor_id=eq.${encodeURIComponent(doctorId)}` : ''

    const response = await fetch(`${apiConfig.restUrl}/appointments?select=*,patients(full_name),doctors(full_name)${doctorFilter}`, {
      headers: getAuthenticatedHeaders()
    })
    
    if (!response.ok) throw new Error('Erro ao buscar agendamentos.')
    
    const data = await response.json()
    return (Array.isArray(data) ? data : []).map(appointmentMapper.toUi)
  },

  async create(uiData) {
    const response = await fetch(`${apiConfig.restUrl}/appointments`, {
      method: 'POST',
      headers: getAuthenticatedHeaders({ Prefer: 'return=representation' }),
      body: JSON.stringify(appointmentMapper.toApi(uiData, 'supabase')),
    })

    if (!response.ok) throw new Error('Falha ao criar o agendamento.')

    const data = await response.json()
    const item = Array.isArray(data) ? data[0] : data
    return appointmentMapper.toUi(item)
  }
}
