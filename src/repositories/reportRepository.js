import { apiConfig, getAuthenticatedHeaders } from '../config/api.js'
import { reportMapper } from '../mappers/reportMapper.js'
import { getResponseError, normalizeItem } from './repositoryUtils.js'

export const reportRepository = {
  async getInitialReports(filters = {}) {
    const query = new URLSearchParams()
    query.set('select', '*')
    query.set('order', filters.order || 'created_at.desc')

    if (filters.patientId) {
      query.set('patient_id', `eq.${filters.patientId}`)
    }

    if (filters.status) {
      query.set('status', `eq.${filters.status}`)
    }

    if (filters.createdBy) {
      query.set('created_by', `eq.${filters.createdBy}`)
    }

    const response = await fetch(`${apiConfig.restUrl}/reports?${query.toString()}`, {
      headers: getAuthenticatedHeaders(),
    })

    if (!response.ok) {
      throw new Error(await getResponseError(response, 'Falha ao buscar relatorios medicos.'))
    }

    const data = await response.json()
    return (Array.isArray(data) ? data : []).map(reportMapper.toUi)
  },

  async create(uiData) {
    const response = await fetch(`${apiConfig.restUrl}/reports`, {
      method: 'POST',
      headers: getAuthenticatedHeaders({ Prefer: 'return=representation' }),
      body: JSON.stringify(reportMapper.toApi(uiData)),
    })

    if (!response.ok) {
      throw new Error(await getResponseError(response, 'Falha ao criar relatorio medico.'))
    }

    const data = await response.json()
    return reportMapper.toUi(normalizeItem(data))
  },

  async update(id, uiData) {
    const response = await fetch(`${apiConfig.restUrl}/reports?id=eq.${id}`, {
      method: 'PATCH',
      headers: getAuthenticatedHeaders({ Prefer: 'return=representation' }),
      body: JSON.stringify(reportMapper.toApi(uiData)),
    })

    if (!response.ok) {
      throw new Error(await getResponseError(response, 'Falha ao atualizar relatorio medico.'))
    }

    const data = await response.json()
    return reportMapper.toUi(normalizeItem(data))
  },
}
