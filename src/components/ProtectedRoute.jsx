import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuth, isAdmin, loading } = useAuth()

  if (loading) return (
    <div className="loading-center">
      <div className="spinner" />
    </div>
  )

  if (!isAuth) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />
  return children
}
