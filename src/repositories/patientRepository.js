import { apiConfig, getAuthenticatedHeaders } from '../config/api.js'

export const patientRepository = {
  // 1. Listar pacientes
  async getAll() {
    const response = await fetch(`${apiConfig.restUrl}/patients?select=*`, { headers: getAuthenticatedHeaders() })
    if (!response.ok) throw new Error('Erro ao buscar pacientes')
    return response.json()
  },

  async getById(patientId) {
    const patients = await this.getAll()
    const patient = patients.find((p) => String(p.id) === String(patientId)) || null
    return patient ? mapPatientToDetail(patient) : null
  },

  async getDirectoryRows() {
    const patients = await this.getAll()
    return patients.map(mapPatientToDirectory)
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

    const response = await fetch(`${apiConfig.restUrl}/patients`, {
      method: 'POST',
      headers: getAuthenticatedHeaders({ Prefer: 'return=representation' }),
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

    const response = await fetch(`${apiConfig.functionsUrl}/create-patient`, {
      method: 'POST',
      headers: getAuthenticatedHeaders(),
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

    const response = await fetch(`${apiConfig.restUrl}/patients?id=eq.${patientId}`, {
      method: 'PATCH',
      headers: getAuthenticatedHeaders({ Prefer: 'return=representation' }),
      body: JSON.stringify(body),
    })

    if (!response.ok) throw new Error('Erro ao atualizar paciente')
    return response.json()
  },

  // 5. Deletar paciente
  async remove(patientId) {
    const response = await fetch(`${apiConfig.restUrl}/patients?id=eq.${patientId}`, {
      method: 'DELETE',
      headers: getAuthenticatedHeaders(),
    })

    if (!response.ok) throw new Error('Erro ao deletar paciente')
    return true
  },
}

function mapPatientToDirectory(patient) {
  return {
    ...patient,
    name: patient.name || patient.full_name || patient.nome || 'Paciente',
    phone: patient.phone || patient.phone_mobile || patient.telefone || '',
    detailId: patient.id,
    insurance: patient.insurance || patient.convenio || 'Particular',
    city: patient.city || patient.cidade || 'Recife',
    state: patient.state || patient.uf || 'PE',
    vip: Boolean(patient.vip),
    lastVisitIso: patient.lastVisitIso || patient.last_visit_iso || null,
    lastVisit: patient.lastVisit || patient.last_visit || 'Ainda nao houve atendimento',
    nextVisit: patient.nextVisit || patient.next_visit || 'Nenhum atendimento agendado',
  }
}

function mapPatientToDetail(patient) {
  const directory = mapPatientToDirectory(patient)

  return {
    ...directory,
    age: patient.age || patient.idade || calculateAge(patient.birth_date),
    document: patient.document || patient.cpf || 'CPF nao informado',
    plan: directory.insurance,
    condition: patient.condition || patient.condicao || 'Sem condicao principal',
    status: patient.status || 'Acompanhamento',
    risk: patient.risk || patient.risco || 'Baixo',
    email: patient.email || '',
    address: patient.address || patient.endereco || 'Endereco nao informado',
    team: patient.team || patient.equipe || [],
    notes: patient.notes || patient.observacoes || [],
    exams: patient.exams || patient.exames || [],
  }
}

function calculateAge(birthDate) {
  if (!birthDate) return 0

  const birth = new Date(birthDate)
  if (Number.isNaN(birth.getTime())) return 0

  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1
  }

  return age
}
