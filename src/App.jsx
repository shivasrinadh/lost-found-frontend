import React from 'react'
import AppRoutes from './routes/AppRoutes'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <div className="page-glow" />
      <Navbar />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <AppRoutes />
      </main>
      <Footer />
    </>
  )
}
