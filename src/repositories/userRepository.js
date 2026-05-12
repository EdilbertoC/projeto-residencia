import { apiConfig, getAuthenticatedHeaders } from '../config/api.js'
import { getResponseError, normalizeCollection } from './repositoryUtils.js'

const USER_PROFILE_TABLES = ['profiles', 'user_profiles']
const USER_LIST_KEYS = ['users', 'usuarios', 'data', 'items', 'results']

export const userRepository = {
  async getAll() {
    let lastResponse = null

    for (const table of USER_PROFILE_TABLES) {
      const query = new URLSearchParams({
        select: '*',
      })
      const response = await fetch(`${apiConfig.restUrl}/${table}?${query.toString()}`, {
        headers: getAuthenticatedHeaders(),
      }).catch(() => null)

      if (!response) continue
      lastResponse = response

      if (response.ok) {
        const data = await response.json().catch(() => null)
        return normalizeCollection(data, USER_LIST_KEYS).map(normalizeListedUser)
      }

      if (![404, 406].includes(response.status)) {
        throw new Error(await getResponseError(response, 'Erro ao listar usuários.'))
      }
    }

    throw new Error(await getResponseError(lastResponse, 'Tabela de perfis de usuários não encontrada.'))
  },

  async getById(userId) {
    const response = await fetch(`${apiConfig.functionsUrl}/user-info-by-id/${encodeURIComponent(userId)}`, {
      method: 'POST',
      headers: getAuthenticatedHeaders(),
    })

    if (!response.ok) {
      throw new Error(await getResponseError(response, 'Erro ao buscar usuário.'))
    }

    return response.json()
  },

  async create(data) {
    const response = await fetch(`${apiConfig.functionsUrl}/create-user`, {
      method: 'POST',
      headers: getAuthenticatedHeaders(),
      body: JSON.stringify(buildCreateUserBody(data)),
    })

    if (!response.ok) {
      throw new Error(await getResponseError(response, 'Erro ao criar usuário.'))
    }

    return response.json()
  },

  async createWithPassword(data) {
    const body = {
      ...buildCreateUserBody(data),
      password: data.password,
    }

    const response = await fetch(`${apiConfig.functionsUrl}/create-user-with-password`, {
      method: 'POST',
      headers: getAuthenticatedHeaders(),
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(await getResponseError(response, 'Erro ao criar usuário com senha.'))
    }

    return response.json()
  },

  async update(userId, data) {
    let lastResponse = null
    const body = cleanPayload({
      email: data.email?.trim(),
      full_name: data.full_name?.trim(),
      phone: data.phone?.trim(),
      phone_mobile: data.phone?.trim(),
      cpf: data.cpf?.trim(),
      role: data.role,
      crm: data.crm?.trim(),
      crm_uf: data.crm_uf?.trim() || data.crmUf?.trim(),
    })

    for (const table of USER_PROFILE_TABLES) {
      const response = await fetch(`${apiConfig.restUrl}/${table}?id=eq.${encodeURIComponent(userId)}`, {
        method: 'PATCH',
        headers: getAuthenticatedHeaders({ Prefer: 'return=representation' }),
        body: JSON.stringify(body),
      }).catch(() => null)

      if (!response) continue
      lastResponse = response

      if (response.ok) {
        const data = await response.json().catch(() => null)
        return normalizeListedUser(normalizeCollection(data)[0] || data || body)
      }

      if (![404, 406].includes(response.status)) {
        throw new Error(await getResponseError(response, 'Erro ao atualizar usuário.'))
      }
    }

    throw new Error(await getResponseError(lastResponse, 'Tabela de perfis de usuários não encontrada.'))
  },

  async remove(userId) {
    const response = await fetch(`${apiConfig.functionsUrl}/delete-user`, {
      method: 'POST',
      headers: getAuthenticatedHeaders(),
      body: JSON.stringify({ userId, user_id: userId }),
    })

    if (!response.ok) {
      throw new Error(await getResponseError(response, 'Erro ao deletar usuário.'))
    }

    return true
  },
}

function buildCreateUserBody(data) {
  const body = {
    email: data.email?.trim(),
    full_name: data.full_name?.trim(),
    phone: data.phone?.trim(),
    cpf: data.cpf?.trim(),
    role: data.role,
    crm: data.crm?.trim(),
    crm_uf: data.crm_uf?.trim() || data.crmUf?.trim(),
  }

  if (data.create_patient_record) {
    body.create_patient_record = true
    body.phone_mobile = data.phone_mobile?.trim() || data.phone?.trim()
  }

  return body
}

function normalizeListedUser(user) {
  return {
    ...user,
    email: user.email || user.user_email || '',
    full_name: user.full_name || user.name || user.nome || '',
    role: Array.isArray(user.roles) ? user.roles[0] : (user.role || user.cargo || ''),
    crm: user.crm || '',
    crm_uf: user.crm_uf || user.crmUf || '',
  }
}

function cleanPayload(payload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  )
}
