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
    } else if (filters.patientIds?.length) {
      query.set('patient_id', `in.(${filters.patientIds.join(',')})`)
    }

    if (filters.status) {
      query.set('status', `eq.${filters.status}`)
    }

    if (filters.createdBy) {
      query.set('created_by', `eq.${filters.createdBy}`)
    } else if (filters.createdByValues?.length === 1) {
      query.set('created_by', `eq.${filters.createdByValues[0]}`)
    } else if (filters.createdByValues?.length > 1) {
      query.set('created_by', `in.(${filters.createdByValues.join(',')})`)
    }

    const response = await fetch(`${apiConfig.restUrl}/reports?${query.toString()}`, {
      headers: getAuthenticatedHeaders(),
    })

    if (!response.ok) {
      throw new Error(await getResponseError(response, 'Falha ao buscar relatórios médicos.'))
    }

    const data = await response.json()
    return (Array.isArray(data) ? data : []).map(reportMapper.toUi)
  },

  async create(uiData) {
    let lastResponse = null

    for (const payload of buildCreatePayloads(reportMapper.toApi(uiData))) {
      const response = await fetch(`${apiConfig.restUrl}/reports`, {
        method: 'POST',
        headers: getAuthenticatedHeaders({ Prefer: 'return=representation' }),
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const data = await response.json()
        return reportMapper.toUi(normalizeItem(data))
      }

      lastResponse = response

      if (response.status !== 400) {
        break
      }
    }

    throw new Error(await getResponseError(lastResponse, 'Falha ao criar relatório médico.'))
  },

  async update(id, uiData) {
    const response = await fetch(`${apiConfig.restUrl}/reports?id=eq.${id}`, {
      method: 'PATCH',
      headers: getAuthenticatedHeaders({ Prefer: 'return=representation' }),
      body: JSON.stringify(reportMapper.toApi(uiData)),
    })

    if (!response.ok) {
      throw new Error(await getResponseError(response, 'Falha ao atualizar relatório médico.'))
    }

    const data = await response.json()
    return reportMapper.toUi(normalizeItem(data))
  },
}

function buildCreatePayloads(payload) {
  return uniquePayloads([
    omitFields(payload, ['order_number', 'created_by', 'updated_by']),
    omitFields(payload, ['order_number', 'created_by', 'updated_by', 'content_json']),
    omitFields(payload, ['order_number', 'created_by', 'updated_by', 'content_json', 'hide_date', 'hide_signature', 'due_at']),
    pickFields(payload, ['patient_id', 'status', 'exam', 'requested_by', 'cid_code', 'diagnosis', 'conclusion', 'content_html']),
    payload,
  ])
}

function omitFields(payload, fields) {
  return Object.fromEntries(
    Object.entries(payload).filter(([field]) => !fields.includes(field)),
  )
}

function pickFields(payload, fields) {
  return Object.fromEntries(
    fields
      .filter((field) => payload[field] !== undefined)
      .map((field) => [field, payload[field]]),
  )
}

function uniquePayloads(payloads) {
  const seen = new Set()

  return payloads.filter((payload) => {
    const signature = JSON.stringify(payload)
    if (seen.has(signature)) return false
    seen.add(signature)
    return true
  })
}
