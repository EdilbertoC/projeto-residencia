import { authRepository } from './authRepository.js'
import { apiConfig, apiEndpoint, getAuthenticatedHeaders } from '../config/api.js'
import { getResponseError } from './repositoryUtils.js'

export const profileRepository = {
  async getCurrentUserProfile() {
    const data = await authRepository.getUser()
    const profile = data?.profile || data?.perfil || {}
    const user = data?.user || data?.usuario || profile || data
    const meta = user?.user_metadata || user?.metadata || user?.app_metadata || {}
    const permissions = data?.permissions || {}
    const roles = Array.isArray(data?.roles) ? data.roles : []
    const avatarUrl =
      profile?.avatar_url ||
      profile?.avatarUrl ||
      user?.avatarUrl ||
      user?.avatar_url ||
      meta.avatar_url ||
      meta.picture ||
      ''

    return {
      id: profile?.id || user?.id || user?.user_id || user?.uid || '',
      email: profile?.email || user?.email || meta.email || '',
      name: profile?.full_name || user?.name || user?.nome || user?.full_name || meta.full_name || meta.name || 'Usuario',
      phone: profile?.phone || user?.phone || user?.telefone || meta.phone || meta.telefone || '',
      role: resolveProfileRole({ permissions, roles, user, meta }),
      unit: profile?.unit || user?.unit || user?.unidade || meta.unit || meta.unidade || 'Clinica Boa Vista',
      avatarUrl,
      doctorId: data?.doctor_id || data?.doctorId || null,
      patientId: data?.patient_id || data?.patientId || null,
      roles,
      permissions,
      isDoctor: Boolean(permissions.isDoctor || roles.includes('doctor') || data?.doctor_id),
      isAdmin: Boolean(permissions.isAdmin || roles.includes('admin')),
    }
  },

  async updateAvatar(file) {
    const profile = await this.getCurrentUserProfile()
    const formData = new FormData()
    formData.append('avatar', file)
    formData.append('file', file)

    const apiResponse = await fetch(apiEndpoint('/upload-avatar'), {
      method: 'POST',
      headers: getAuthenticatedHeaders({ 'Content-Type': undefined }),
      body: formData,
    }).catch(() => null)

    if (apiResponse?.ok) {
      return normalizeAvatarResponse(await apiResponse.json().catch(() => ({})))
    }

    if (apiResponse && ![404, 405].includes(apiResponse.status)) {
      throw new Error(await getResponseError(apiResponse, 'Falha ao enviar avatar.'))
    }

    if (!profile.id) {
      throw new Error('Nao foi possivel identificar o usuario para enviar o avatar.')
    }

    const extension = file.name?.split('.').pop() || 'jpg'
    const objectPath = `${profile.id}/avatar.${extension}`
    const response = await fetch(`${apiConfig.storageUrl}/object/avatars/${objectPath}`, {
      method: 'POST',
      headers: getAuthenticatedHeaders({
        'Content-Type': file.type || 'application/octet-stream',
        'x-upsert': 'true',
      }),
      body: file,
    })

    if (!response.ok) {
      throw new Error(await getResponseError(response, 'Falha ao enviar avatar.'))
    }

    return {
      avatarUrl: `${apiConfig.storageUrl}/object/public/avatars/${objectPath}`,
      path: objectPath,
    }
  },
}

function normalizeAvatarResponse(data) {
  return {
    avatarUrl: data.avatarUrl || data.avatar_url || data.publicUrl || data.public_url || data.url || '',
    path: data.path || data.key || '',
  }
}

function resolveProfileRole({ permissions, roles, user, meta }) {
  if (permissions.isAdmin || roles.includes('admin')) return 'Administrador'
  if (permissions.isManager || roles.includes('manager')) return 'Gestor'
  if (permissions.isDoctor || roles.includes('doctor')) return 'Medico(a)'
  if (permissions.isSecretary || roles.includes('secretary')) return 'Secretaria'
  if (permissions.isPatient || roles.includes('patient')) return 'Paciente'

  return user?.role || user?.cargo || meta.role || meta.cargo || 'Usuario do Sistema'
}
