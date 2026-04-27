const BASE_URL = 'https://yuanqfswhberkoevtmfr.supabase.co/rest/v1'
const FUNCTIONS_URL = 'https://yuanqfswhberkoevtmfr.supabase.co/functions/v1'
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1YW5xZnN3aGJlcmtvZXZ0bWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NTQzNjksImV4cCI6MjA3MDUzMDM2OX0.g8Fm4XAvtX46zifBZnYVH4tVuQkqUH6Ia9CXQj4DztQ'

const headers = {
  'apikey': API_KEY,
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
}

export const patientRepository = {
  // 1. Listar pacientes
  async getAll() {
    const response = await fetch(`${BASE_URL}/patients?select=*`, { headers })
    if (!response.ok) throw new Error('Erro ao buscar pacientes')
    return response.json()
  },

  async getById(patientId) {
    const patients = await this.getAll()
    return patients.find((p) => String(p.id) === String(patientId)) || null
  },

  async getDirectoryRows() {
    const patients = await this.getAll()
    return patients.map((patient) => ({
      ...patient,
      name: patient.full_name,
      phone: patient.phone_mobile,
      detailId: patient.id,
      insurance: 'Particular',
      city: 'Recife',
      state: 'PE',
      vip: false,
      lastVisitIso: null,
      lastVisit: 'Ainda nao houve atendimento',
      nextVisit: 'Nenhum atendimento agendado',
    }))
  },

  // 2. Criar paciente (direto)
async create(data) {
  const body = {
    full_name: data.name,
    cpf: data.cpf,
    email: data.email,
    phone_mobile: data.phone,
    birth_date: data.birthDate || null,
    created_by: data.createdBy || '00000000-0000-0000-0000-000000000000',
  }

  const response = await fetch(`${BASE_URL}/patients`, {
    method: 'POST',
    headers: { ...headers, 'Prefer': 'return=representation' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    console.error('Erro da API ao criar paciente:', error)
    throw new Error(error.message || error.hint || JSON.stringify(error))
  }

  return response.json()
},

  // 3. Criar paciente com validação de CPF (Edge Function)
  async createWithValidation(data) {
    const body = {
      full_name: data.name,
      cpf: data.cpf,
      email: data.email,
      phone_mobile: data.phone,
      birth_date: data.birthDate || null,
      created_by: data.createdBy || '00000000-0000-0000-0000-000000000000',
    }

    const response = await fetch(`${FUNCTIONS_URL}/create-patient`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || 'Erro ao criar paciente com validacao')
    }

    return response.json()
  },

  // 4. Atualizar paciente
  async update(patientId, data) {
    const body = {
      full_name: data.name,
      cpf: data.cpf,
      email: data.email,
      phone_mobile: data.phone,
      birth_date: data.birthDate || null,
    }

    const response = await fetch(`${BASE_URL}/patients?id=eq.${patientId}`, {
      method: 'PATCH',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify(body),
    })

    if (!response.ok) throw new Error('Erro ao atualizar paciente')
    return response.json()
  },

  // 5. Deletar paciente
  async remove(patientId) {
    const response = await fetch(`${BASE_URL}/patients?id=eq.${patientId}`, {
      method: 'DELETE',
      headers,
    })

    if (!response.ok) throw new Error('Erro ao deletar paciente')
    return true
  },
}