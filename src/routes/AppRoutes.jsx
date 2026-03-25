import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import ProtectedRoute from '../components/ProtectedRoute'

import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import ItemList from '../pages/ItemList'
import ItemDetails from '../pages/ItemDetails'
import ReportLost from '../pages/ReportLost'
import ReportFound from '../pages/ReportFound'
import MyReports from '../pages/MyReports'
import AdminDashboard from '../pages/AdminDashboard'
import Analytics from '../pages/Analytics'

export default function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/items" element={<ItemList />} />
        <Route path="/items/:id" element={<ItemDetails />} />

        <Route path="/report/lost" element={<ProtectedRoute><ReportLost /></ProtectedRoute>} />
        <Route path="/report/found" element={<ProtectedRoute><ReportFound /></ProtectedRoute>} />
        <Route path="/my-reports" element={<ProtectedRoute><MyReports /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  )
}
