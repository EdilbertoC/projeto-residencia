import {
  apiConfig,
  apiEndpoint,
  clearAuthSession,
  getAnonHeaders,
  getAuthenticatedHeaders,
  getAuthSession,
  hasAuthenticatedSession,
  saveAuthSession,
} from '../config/api.js'

export const authRepository = {
  async login({ email, password }) {
    const response = await fetch(`${apiConfig.supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: getAnonHeaders(),
      body: JSON.stringify({ email: email?.trim(), password }),
    })

    if (!response.ok) {
      throw new Error(await getResponseError(response, 'Erro de autenticacao.'))
    }

    const session = await response.json()
    if (!session?.access_token) {
      throw new Error('Falha no login. Token nao recebido.')
    }

    saveAuthSession(session)
    return session
  },

  async requestPasswordReset(email) {
    const payload = { email: email?.trim() }
    const apiResponse = await fetch(apiEndpoint('/solicitar-reset-de-senha'), {
      method: 'POST',
      headers: getAnonHeaders(),
      body: JSON.stringify(payload),
    }).catch(() => null)

    if (apiResponse?.ok) {
      return true
    }

    if (apiResponse && !shouldFallback(apiResponse)) {
      throw new Error(await getResponseError(apiResponse, 'Erro ao solicitar reset de senha.'))
    }

    const supabaseResponse = await fetch(`${apiConfig.supabaseUrl}/auth/v1/recover`, {
      method: 'POST',
      headers: getAnonHeaders(),
      body: JSON.stringify(payload),
    })

    if (!supabaseResponse.ok) {
      throw new Error(await getResponseError(supabaseResponse, 'Erro ao enviar link de recuperacao.'))
    }

    return true
  },

  async getUser() {
    const apiEndpoints = [
      apiEndpoint('/user-info'),
      apiEndpoint('/informacoes-do-usuario-autenticado'),
    ]

    for (const url of apiEndpoints) {
      const apiResponse = await fetch(url, {
        method: 'GET',
        headers: getAuthenticatedHeaders(),
      }).catch(() => null)

      if (apiResponse?.ok) {
        return apiResponse.json()
      }

      if (apiResponse && !shouldFallback(apiResponse)) {
        throw new Error(await getResponseError(apiResponse, 'Erro ao resgatar perfil de usuario.'))
      }
    }

    const response = await fetch(`${apiConfig.supabaseUrl}/auth/v1/user`, {
      method: 'GET',
      headers: getAuthenticatedHeaders(),
    })

    if (!response.ok) {
      throw new Error(await getResponseError(response, 'Erro ao resgatar perfil de usuario.'))
    }

    return response.json()
  },

  getSession() {
    return getAuthSession()
  },

  isAuthenticated() {
    return hasAuthenticatedSession()
  },

  async logout() {
    try {
      const apiResponse = await fetch(apiEndpoint('/logout'), {
        method: 'POST',
        headers: getAuthenticatedHeaders(),
      }).catch(() => null)

      if (apiResponse?.ok || (apiResponse && !shouldFallback(apiResponse))) return

      await fetch(`${apiConfig.supabaseUrl}/auth/v1/logout`, {
        method: 'POST',
        headers: getAuthenticatedHeaders(),
      })
    } catch {
      // A sessao local precisa ser removida mesmo quando o backend nao responde.
    } finally {
      clearAuthSession()
    }
  },
}

function shouldFallback(response) {
  return [404, 405].includes(response.status)
}

async function getResponseError(response, fallbackMessage) {
  const error = await response.json().catch(() => ({}))
  return error.error_description || error.msg || error.message || error.error || fallbackMessage
}
