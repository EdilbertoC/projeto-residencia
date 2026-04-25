import { useCallback, useEffect, useMemo, useState } from 'react'

import './App.css'
import { useAuth } from './auth/useAuth.js'
import { AppShell } from './components/AppShell.jsx'
import { AgendaPage } from './pages/AgendaPage.jsx'
import { AnalyticsPage } from './pages/AnalyticsPage.jsx'
import { FinancialPage } from './pages/FinancialPage.jsx'
import { ForgotPasswordPage, LoginPage, RegisterPage } from './pages/AuthPages.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { MedicalRecordsPage } from './pages/MedicalRecordsPage.jsx'
import { MessagesPage } from './pages/MessagesPage.jsx'
import { NotFoundPage } from './pages/NotFoundPage.jsx'
import { PatientDetailPage, PatientsPage } from './pages/PatientsPage.jsx'
import { ProfilePage } from './pages/ProfilePage.jsx'
import { ReportsPage } from './pages/ReportsPage.jsx'
import { SettingsPage } from './pages/SettingsPage.jsx'
import { TeamPage } from './pages/TeamPage.jsx'
import { VisitsPage } from './pages/VisitsPage.jsx'
import { patientRepository } from './repositories/patientRepository.js'

function App() {
  const [location, setLocation] = useState(() => readLocation())
  const auth = useAuth()

  const navigate = useCallback((to, options = {}) => {
    if (options.replace) {
      window.history.replaceState({}, '', to)
    } else {
      window.history.pushState({}, '', to)
    }

    setLocation(readLocation())
    const hash = to.split('#')[1]
    window.requestAnimationFrame(() => {
      if (hash) {
        document.getElementById(hash)?.scrollIntoView({ block: 'start' })
      } else {
        window.scrollTo({ left: 0, top: 0 })
      }
    })
  }, [])

  useEffect(() => {
    function handlePopState() {
      setLocation(readLocation())
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    if (auth.isLoading) {
      return
    }

    const route = resolveRoute(location.pathname, navigate, auth)

    let redirectPath = null

    if (!auth.isAuthenticated && route.withShell) {
      redirectPath = '/login'
    } else if (auth.isAuthenticated && (location.pathname === '/' || location.pathname === '/login')) {
      redirectPath = '/inicio'
    }

    if (!redirectPath) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      navigate(redirectPath, { replace: true })
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [auth, location.pathname, navigate])

  const route = useMemo(() => resolveRoute(location.pathname, navigate, auth), [auth, location.pathname, navigate])

  if (auth.isLoading) {
    return <FullPageLoading />
  }

  if (!auth.isAuthenticated && route.withShell) {
    return <FullPageLoading />
  }

  if (auth.isAuthenticated && (location.pathname === '/' || location.pathname === '/login')) {
    return <FullPageLoading />
  }

  if (!route.withShell) {
    return route.element
  }

  async function handleLogout() {
    const result = await auth.logout()

    if (result.ok) {
      navigate('/login', { replace: true })
    }
  }

  const account = route.account || buildAccount(auth)

  return (
    <AppShell
      account={account}
      currentPath={location.pathname}
      navigate={navigate}
      onLogout={handleLogout}
      routeTitle={route.title}
    >
      {route.element}
    </AppShell>
  )
}

function resolveRoute(pathname, navigate, auth = {}) {
  const account = buildAccount(auth)

  if (pathname === '/' || pathname === '/login') {
    return {
      element: <LoginPage navigate={navigate} />,
      title: 'Login',
      withShell: false,
    }
  }

  if (pathname === '/cadastro') {
    return {
      element: <RegisterPage navigate={navigate} />,
      title: 'Cadastro',
      withShell: false,
    }
  }

  if (pathname === '/recuperar-senha') {
    return {
      element: <ForgotPasswordPage navigate={navigate} />,
      title: 'Recuperar senha',
      withShell: false,
    }
  }

  if (pathname === '/inicio' || pathname === '/home' || pathname === '/dashboard') {
    return {
      element: <HomePage navigate={navigate} />,
      title: 'Painel',
      withShell: true,
    }
  }

  if (pathname === '/agenda') {
    return {
      element: <AgendaPage navigate={navigate} />,
      title: 'Agenda',
      withShell: true,
    }
  }

  if (pathname === '/pacientes') {
    return {
      element: <PatientsPage navigate={navigate} />,
      title: 'Pacientes',
      withShell: true,
    }
  }

  if (pathname === '/prontuario') {
    return {
      element: <MedicalRecordsPage navigate={navigate} />,
      title: 'Prontuário',
      withShell: true,
    }
  }

  if (pathname.startsWith('/pacientes/')) {
    const patientId = pathname.split('/')[2]
    const patient = patientRepository.getById(patientId)

    return {
      element: patient ? (
        <PatientDetailPage navigate={navigate} patient={patient} />
      ) : (
        <NotFoundPage navigate={navigate} />
      ),
      title: patient?.name || 'Paciente nao encontrado',
      withShell: true,
    }
  }

  if (pathname === '/consultas') {
    return {
      element: <VisitsPage navigate={navigate} />,
      title: 'Consultas',
      withShell: true,
    }
  }

  if (pathname === '/laudos') {
    return {
      element: <ReportsPage navigate={navigate} />,
      title: 'Laudos',
      withShell: true,
    }
  }

  if (pathname === '/relatorios') {
    return {
      element: <AnalyticsPage />,
      title: 'Relatórios',
      withShell: true,
    }
  }

  if (pathname === '/financeiro') {
    return {
      element: <FinancialPage />,
      title: 'Financeiro',
      withShell: true,
    }
  }

  if (pathname === '/camunicacao' || pathname === '/comunicacao' || pathname === '/mensagens') {
    return {
      element: <MessagesPage navigate={navigate} />,
      title: 'Comunicação',
      withShell: true,
    }
  }

  if (pathname === '/profissionais') {
    return {
      element: <TeamPage navigate={navigate} />,
      title: 'Profissionais',
      withShell: true,
    }
  }

  if (pathname === '/perfil') {
    return {
      element: <ProfilePage account={account} key={account.id || account.email} />,
      title: 'Perfil',
      withShell: true,
      account,
    }
  }

  if (pathname === '/configuracoes' || pathname === '/config') {
    return {
      element: <SettingsPage navigate={navigate} />,
      title: 'Configurações',
      withShell: true,
    }
  }

  return {
    element: <NotFoundPage navigate={navigate} />,
    title: 'Tela nao encontrada',
    withShell: true,
    account,
  }
}

function buildAccount(auth) {
  const profile = auth.profile || {}
  const user = auth.user || {}
  const metadata = user.user_metadata || {}
  const primaryRole = auth.primaryRole || user.app_metadata?.user_role || user.role || ''
  const displayName =
    profile.full_name ||
    profile.name ||
    profile.display_name ||
    metadata.full_name ||
    metadata.name ||
    user.email ||
    'Usuario'
  const roleLabel = formatRole(primaryRole || profile.role || profile.cargo)
  const email = profile.email || user.email || ''

  return {
    email,
    id: user.id || profile.id || '',
    initials: getInitials(displayName || email),
    name: displayName,
    phone: profile.phone || profile.phone_mobile || profile.telefone || '',
    primaryRole,
    profile,
    roleLabel,
    roles: auth.roles || [],
    unit: profile.unit || profile.clinic || profile.clinica || profile.organization || '',
  }
}

function formatRole(role) {
  if (!role) {
    return 'Usuario autenticado'
  }

  const labels = {
    admin: 'Administrador',
    authenticated: 'Usuario autenticado',
    doctor: 'Medico(a)',
    medico: 'Medico(a)',
    patient: 'Paciente',
    paciente: 'Paciente',
    receptionist: 'Recepcao',
    recepcao: 'Recepcao',
  }

  return labels[role] || role.replace(/_/g, ' ')
}

function getInitials(value) {
  const parts = String(value || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (parts.length === 0) {
    return 'U'
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function FullPageLoading() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#0a1628] px-6 text-white">
      <div className="text-center">
        <div className="mx-auto size-8 animate-spin rounded-full border-2 border-white/20 border-t-[#3b82f6]" />
        <p className="mt-4 text-sm text-white/50">Carregando sessao...</p>
      </div>
    </main>
  )
}

function readLocation() {
  return {
    pathname: normalizePath(window.location.pathname),
    search: window.location.search,
  }
}

function normalizePath(pathname) {
  if (!pathname || pathname === '/') {
    return '/'
  }

  return pathname.replace(/\/+$/, '')
}

export default App
