import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('findit_token')
    const storedUser = localStorage.getItem('findit_user')
    if (stored && storedUser) {
      setToken(stored)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (credentials) => {
    const data = await authService.login(credentials)
    localStorage.setItem('findit_token', data.token)
    localStorage.setItem('findit_user', JSON.stringify({
      id: data.userId, username: data.username,
      email: data.email, role: data.role
    }))
    setToken(data.token)
    setUser({ id: data.userId, username: data.username, email: data.email, role: data.role })
    return data
  }

  const register = async (payload) => {
    const data = await authService.register(payload)
    localStorage.setItem('findit_token', data.token)
    localStorage.setItem('findit_user', JSON.stringify({
      id: data.userId, username: data.username,
      email: data.email, role: data.role
    }))
    setToken(data.token)
    setUser({ id: data.userId, username: data.username, email: data.email, role: data.role })
    return data
  }

  const logout = () => {
    localStorage.removeItem('findit_token')
    localStorage.removeItem('findit_user')
    setToken(null)
    setUser(null)
  }

  const isAdmin = user?.role === 'ADMIN'
  const isAuth  = !!token

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAdmin, isAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
