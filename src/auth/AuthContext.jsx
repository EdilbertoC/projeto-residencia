import { useCallback, useEffect, useMemo, useState } from 'react'

import { AuthContext } from './authContext.js'
import { supabase } from '../lib/supabaseClient.js'

const emptyAuthState = {
  session: null,
  user: null,
  profile: null,
  roles: [],
  primaryRole: null,
  isAuthenticated: false,
  isLoading: true,
  authError: null,
  userInfoError: null,
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(emptyAuthState)

  const applySession = useCallback(async (session) => {
    if (!session) {
      setAuthState({
        ...emptyAuthState,
        isLoading: false,
      })
      return
    }

    setAuthState((current) => ({
      ...current,
      session,
      user: session.user,
      isAuthenticated: true,
      isLoading: true,
      authError: null,
      userInfoError: null,
    }))

    const { data, error } = await supabase.functions.invoke('user-info')
    const normalized = normalizeSessionData(session, error ? null : data)

    setAuthState({
      ...normalized,
      isLoading: false,
      authError: null,
      userInfoError: error?.message || null,
    })
  }, [])

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) {
        return
      }

      if (error) {
        setAuthState({
          ...emptyAuthState,
          isLoading: false,
          authError: error.message,
        })
        return
      }

      applySession(data.session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        applySession(session)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [applySession])

  const login = useCallback(async ({ email, password }) => {
    setAuthState((current) => ({
      ...current,
      authError: null,
      userInfoError: null,
    }))

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setAuthState((current) => ({
        ...current,
        authError: 'E-mail ou senha invalidos.',
      }))
      return { ok: false, error }
    }

    await applySession(data.session)
    return { ok: true, data }
  }, [applySession])

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      setAuthState((current) => ({
        ...current,
        authError: error.message,
      }))
      return { ok: false, error }
    }

    await applySession(null)
    return { ok: true }
  }, [applySession])

  const value = useMemo(() => ({
    ...authState,
    login,
    logout,
  }), [authState, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function normalizeSessionData(session, userInfo) {
  const user = session.user
  const profile = isPlainObject(userInfo?.profile) ? userInfo.profile : null
  const roles = normalizeRoles(userInfo?.roles, user)
  const primaryRole = roles[0] || null

  return {
    session,
    user,
    profile,
    roles,
    primaryRole,
    isAuthenticated: true,
  }
}

function normalizeRoles(roles, user) {
  if (Array.isArray(roles) && roles.length > 0) {
    return roles.filter(Boolean)
  }

  const fallbackRole = user?.app_metadata?.user_role || user?.role
  return fallbackRole ? [fallbackRole] : []
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}
