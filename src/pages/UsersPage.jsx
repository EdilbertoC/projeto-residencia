import { useEffect, useState } from 'react'

import { ADMIN_CREATABLE_ROLES, GESTOR_CREATABLE_ROLES, hasCapability, normalizeRole, ROLE_LABELS } from '../config/permissions.js'
import { userRepository } from '../repositories/userRepository.js'

const darkInput =
  'h-10 w-full rounded-lg border border-[#404040] bg-[#1a1a1a] px-3 text-sm text-[#e5e5e5] outline-none transition placeholder:text-[#737373] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]'
const darkLabel = 'mb-1.5 block text-xs font-medium text-[#e5e5e5]'
const authMethodOptions = [
  {
    value: 'magic_link',
    label: 'Magic Link',
    description: 'Enviar link de acesso por email',
  },
  {
    value: 'password',
    label: 'Email e senha',
    description: 'Definir senha inicial agora',
  },
]
const initialUserForm = {
  email: '',
  full_name: '',
  phone: '',
  cpf: '',
  role: '',
  auth_method: 'magic_link',
  password: '',
  confirm_password: '',
  create_patient_record: false,
}

export function UsersPage({ role: currentRole }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [form, setForm] = useState(initialUserForm)
  const [roleFilter, setRoleFilter] = useState('Todos')

  const normalizedRole = normalizeRole(currentRole)
  const canManageUsers = hasCapability(normalizedRole, 'manageUsers')
  const creatableRoles = normalizedRole === 'admin' ? ADMIN_CREATABLE_ROLES : GESTOR_CREATABLE_ROLES
  const isPasswordCreation = form.auth_method === 'password'
  const filterableRoles = normalizedRole === 'admin' ? ADMIN_CREATABLE_ROLES : GESTOR_CREATABLE_ROLES
  const filteredUsers = users.filter((user) => {
    if (roleFilter === 'Todos') return true
    return normalizeRole(getUserRole(user)) === roleFilter
  })

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    setLoading(true)
    setError(null)
    try {
      const data = await userRepository.getAll()
      setUsers(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleFormChange(event) {
    const { checked, name, type, value } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleCreate(event) {
    event.preventDefault()
    if (!canManageUsers) {
      window.alert('Você não tem permissão para criar usuários.')
      return
    }

    if (!form.email || !form.full_name || !form.phone || !form.cpf || !form.role) {
      window.alert('Preencha email, nome completo, celular, CPF e perfil.')
      return
    }

    if (isPasswordCreation) {
      if (!form.password || !form.confirm_password) {
        window.alert('Preencha a senha e a confirmação de senha.')
        return
      }

      if (form.password.length < 8) {
        window.alert('A senha deve ter pelo menos 8 caracteres.')
        return
      }

      if (form.password !== form.confirm_password) {
        window.alert('A confirmação de senha não confere.')
        return
      }
    }

    setSaving(true)
    try {
      if (isPasswordCreation) {
        await userRepository.createWithPassword(form)
        window.alert(`Usuário criado com email e senha para ${form.email}.`)
      } else {
        await userRepository.create(form)
        window.alert(`Usuário criado! Magic Link enviado para ${form.email}.`)
      }
      setModalOpen(false)
      setForm(initialUserForm)
      loadUsers()
    } catch (err) {
      window.alert(`Erro ao criar usuário: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(user) {
    if (!canManageUsers) {
      window.alert('Você não tem permissão para deletar usuários.')
      return
    }

    const confirmed = window.confirm(
      `⚠️ ATENÇÃO: Esta operação é IRREVERSÍVEL!\n\nO usuário "${user.full_name || user.email}" e TODOS os dados relacionados (perfil, agendamentos, registros) serão deletados permanentemente.\n\nDeseja continuar?`
    )
    if (!confirmed) return

    setDeletingId(user.id)
    try {
      await userRepository.remove(user.id)
      setUsers((current) => current.filter((u) => u.id !== user.id))
    } catch (err) {
      window.alert(`Erro ao deletar usuário: ${err.message}`)
    } finally {
      setDeletingId(null)
    }
  }

  if (!canManageUsers) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-[#404040] bg-[#262626] p-8 text-center text-[#e5e5e5]">
        <h1 className="text-xl font-bold">Acesso não permitido</h1>
        <p className="mt-2 text-sm text-[#a3a3a3]">Somente Administrador e Gestão/Coordenação podem gerenciar usuários.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 text-[#e5e5e5]">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#e5e5e5]">Usuários do Sistema</h1>
          <p className="mt-1 text-sm text-[#a3a3a3]">Gerencie os usuários e seus perfis de acesso</p>
        </div>
        <button
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#3b82f6] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#2563eb] md:w-auto"
          onClick={() => setModalOpen(true)}
          type="button"
        >
          + Novo usuário
        </button>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-[#a3a3a3]">Carregando usuários...</p>
      ) : error ? (
        <p className="py-10 text-center text-sm text-red-400">Erro ao carregar usuários: {error}</p>
      ) : (
        <div className="rounded-2xl border border-[#404040] bg-[#262626] shadow-sm">
          <div className="flex flex-col gap-3 border-b border-[#404040] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#e5e5e5]">Filtros</p>
              <p className="mt-1 text-xs text-[#a3a3a3]">
                {filteredUsers.length} de {users.length} usuários exibidos
              </p>
            </div>
            <label className="grid gap-1.5 text-xs font-semibold text-[#a3a3a3] sm:min-w-56">
              <span>Perfil</span>
              <select
                className={darkInput}
                onChange={(event) => setRoleFilter(event.target.value)}
                value={roleFilter}
              >
                <option value="Todos">Todos os perfis</option>
                {filterableRoles.map((role) => (
                  <option key={`filter-role-${role}`} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left text-sm">
              <thead className="bg-[#171717] text-xs font-semibold uppercase text-[#a3a3a3]">
                <tr>
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Perfil</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#404040]">
                {filteredUsers.length ? (
                  filteredUsers.map((user) => {
                    const userRole = getUserRole(user)
                    return (
                      <tr className="transition hover:bg-[#303030]" key={user.id}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="grid size-8 place-items-center rounded-full bg-[#333333] text-xs font-bold text-[#3b82f6]">
                              {(user.full_name || user.email || '?').charAt(0).toUpperCase()}
                            </span>
                            <span className="font-medium text-[#e5e5e5]">{user.full_name || '—'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#a3a3a3]">{user.email}</td>
                        <td className="px-6 py-4">
                          <RoleBadge role={userRole} />
                        </td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            user.email_confirmed_at
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {user.email_confirmed_at ? 'Ativo' : 'Pendente'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            className="rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-3 py-1.5 text-xs font-semibold text-[#ef4444] transition hover:bg-[#ef4444]/20 disabled:opacity-50"
                            disabled={deletingId === user.id}
                            onClick={() => handleDelete(user)}
                            type="button"
                          >
                            {deletingId === user.id ? 'Deletando...' : 'Deletar'}
                          </button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td className="px-6 py-10 text-center text-[#a3a3a3]" colSpan={5}>
                      {users.length ? 'Nenhum usuário encontrado para o perfil selecionado.' : 'Nenhum usuário encontrado.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setModalOpen(false)}>
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#404040] bg-[#262626] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#e5e5e5]">Novo Usuário</h2>
                <p className="mt-1 text-xs text-[#a3a3a3]">
                  {isPasswordCreation ? 'Crie o acesso inicial com email e senha.' : 'Um Magic Link sera enviado para o email cadastrado.'}
                </p>
              </div>
              <button
                className="rounded p-1 text-[#a3a3a3] transition hover:bg-[#333333]"
                onClick={() => setModalOpen(false)}
                type="button"
              >
                ✕
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleCreate}>
              <div>
                <span className={darkLabel}>Criar usuário usando *</span>
                <div className="grid gap-3 sm:grid-cols-2">
                  {authMethodOptions.map((option) => {
                    const selected = form.auth_method === option.value
                    return (
                      <label
                        className={`cursor-pointer rounded-lg border p-3 transition ${
                          selected
                            ? 'border-[#3b82f6] bg-[#3b82f6]/15 text-[#e5e5e5]'
                            : 'border-[#404040] bg-[#1a1a1a] text-[#a3a3a3] hover:border-[#525252] hover:text-[#e5e5e5]'
                        }`}
                        key={option.value}
                      >
                        <span className="flex items-start gap-3">
                          <input
                            checked={selected}
                            className="mt-1 size-4 accent-[#3b82f6]"
                            name="auth_method"
                            onChange={handleFormChange}
                            type="radio"
                            value={option.value}
                          />
                          <span>
                            <span className="block text-sm font-semibold">{option.label}</span>
                            <span className="mt-1 block text-xs text-[#a3a3a3]">{option.description}</span>
                          </span>
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className={darkLabel}>Nome completo *</label>
                <input
                  className={darkInput}
                  name="full_name"
                  onChange={handleFormChange}
                  placeholder="Ex: João da Silva"
                  required
                  value={form.full_name}
                />
              </div>

              <div>
                <label className={darkLabel}>Email *</label>
                <input
                  className={darkInput}
                  name="email"
                  onChange={handleFormChange}
                  placeholder="email@exemplo.com"
                  required
                  type="email"
                  value={form.email}
                />
              </div>

              <div>
                <label className={darkLabel}>Celular *</label>
                <input
                  className={darkInput}
                  maxLength={15}
                  name="phone"
                  onChange={handleFormChange}
                  placeholder="(00) 00000-0000"
                  required
                  value={form.phone}
                />
              </div>

              <div>
                <label className={darkLabel}>CPF *</label>
                <input
                  className={darkInput}
                  maxLength={14}
                  name="cpf"
                  onChange={handleFormChange}
                  placeholder="000.000.000-00"
                  required
                  value={form.cpf}
                />
              </div>

              {isPasswordCreation ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={darkLabel}>Senha *</label>
                    <input
                      autoComplete="new-password"
                      className={darkInput}
                      minLength={8}
                      name="password"
                      onChange={handleFormChange}
                      placeholder="Mínimo 8 caracteres"
                      required={isPasswordCreation}
                      type="password"
                      value={form.password}
                    />
                  </div>
                  <div>
                    <label className={darkLabel}>Confirmar senha *</label>
                    <input
                      autoComplete="new-password"
                      className={darkInput}
                      minLength={8}
                      name="confirm_password"
                      onChange={handleFormChange}
                      placeholder="Repita a senha"
                      required={isPasswordCreation}
                      type="password"
                      value={form.confirm_password}
                    />
                  </div>
                </div>
              ) : null}

              <div>
                <label className={darkLabel}>Perfil de acesso *</label>
                <select
                  className={darkInput}
                  name="role"
                  onChange={handleFormChange}
                  required
                  value={form.role}
                >
                  <option value="">Selecione um perfil</option>
                  {creatableRoles.map((r) => (
                    <option key={`role-option-${r}`} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-[#e5e5e5]">
                <input
                  checked={form.create_patient_record}
                  className="size-4 accent-[#3b82f6]"
                  name="create_patient_record"
                  onChange={handleFormChange}
                  type="checkbox"
                />
                Criar também um registro de paciente
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  className="rounded-lg border border-[#404040] bg-[#262626] px-4 py-2 text-sm font-medium text-[#e5e5e5] transition hover:bg-[#333333]"
                  disabled={saving}
                  onClick={() => setModalOpen(false)}
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  className="rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2563eb] disabled:opacity-60"
                  disabled={saving}
                  type="submit"
                >
                  {saving ? 'Criando...' : isPasswordCreation ? 'Criar com senha' : 'Criar e enviar Magic Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function RoleBadge({ role }) {
  const styles = {
    admin: 'bg-purple-500/20 text-purple-400',
    gestor: 'bg-blue-500/20 text-blue-400',
    medico: 'bg-emerald-500/20 text-emerald-400',
    secretaria: 'bg-amber-500/20 text-amber-400',
    paciente: 'bg-[#303030] text-[#a3a3a3]',
  }

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[role] || styles.paciente}`}>
      {ROLE_LABELS[role] || role}
    </span>
  )
}

function getUserRole(user) {
  return Array.isArray(user.roles) ? user.roles[0] : (user.role ?? '—')
}
