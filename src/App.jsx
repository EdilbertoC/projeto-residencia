import { useCallback, useEffect, useMemo, useState } from 'react'

import { authRepository } from './repositories/authRepository.js'

import './App.css'
import { AppShell } from './components/AppShell.jsx'
import { AgendaPage } from './pages/AgendaPage.jsx'
import { AnalyticsPage } from './pages/AnalyticsPage.jsx'
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

  const route = useMemo(() => resolveRoute(location.pathname, navigate), [location.pathname, navigate])
  const isAuthenticated = authRepository.isAuthenticated()

  if (!route.withShell) {
    return route.element
  }

  if (!isAuthenticated) {
    return <LoginPage navigate={navigate} />
  }

  return (
    <AppShell currentPath={location.pathname} navigate={navigate} routeTitle={route.title}>
      {route.element}
    </AppShell>
  )
}

function resolveRoute(pathname, navigate) {
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

    return {
      element: <PatientDetailRoute navigate={navigate} patientId={patientId} />,
      title: 'Paciente',
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
      title: 'Relatorios medicos',
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
      element: <ProfilePage navigate={navigate} />,
      title: 'Perfil',
      withShell: true,
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
  }
}

function PatientDetailRoute({ navigate, patientId }) {
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    patientRepository.getById(patientId)
      .then((data) => {
        if (active) setPatient(data)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [patientId])

  if (loading) {
    return <div className="pt-10 text-sm text-[#a3a3a3]">Carregando paciente...</div>
  }

  return patient ? <PatientDetailPage navigate={navigate} patient={patient} /> : <NotFoundPage navigate={navigate} />
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
