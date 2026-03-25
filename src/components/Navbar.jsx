import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Bell, Menu, X, LogOut, User,
  LayoutDashboard, FileText, Plus, ChevronDown
} from 'lucide-react'

export default function Navbar() {
  const { isAuth, isAdmin, user, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false); setDropOpen(false) }, [location])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        transition: 'background 0.3s ease, backdrop-filter 0.3s ease, border-color 0.3s ease',
        background: scrolled ? 'rgba(10,10,15,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
      }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <motion.div
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg,#f5a623,#ff7b3a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 800, color: '#0a0a0f',
                fontFamily: 'var(--font-display)',
                boxShadow: '0 4px 16px rgba(245,166,35,0.4)',
              }}>F</motion.div>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 20, letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg,#f0efe8,#9b9a94)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>FindIt</span>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
            <NavLink to="/items" icon="🔍" label="Browse" />
            {isAuth && <NavLink to="/my-reports" icon="📋" label="My Reports" />}
            {isAuth && <NavLink to="/analytics" icon="📊" label="Analytics" />}
            {isAdmin && <NavLink to="/admin" icon="⚡" label="Admin" />}
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isAuth ? (
              <>
                {/* Report button */}
                <div style={{ position: 'relative' }}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-primary btn-sm"
                    onClick={() => setDropOpen(d => !d)}
                    style={{ gap: 6 }}
                  >
                    <Plus size={15} strokeWidth={2.5} />
                    Report
                    <motion.div animate={{ rotate: dropOpen ? 180 : 0 }}>
                      <ChevronDown size={13} />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {dropOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        style={{
                          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                          background: 'var(--bg-elevated)', border: '1px solid var(--border-normal)',
                          borderRadius: 'var(--r-lg)', padding: 8, minWidth: 180,
                          boxShadow: 'var(--shadow-lg)', zIndex: 200,
                          transformOrigin: 'top right'
                        }}>
                        <DropItem to="/report/lost" emoji="😢" label="Lost Item" sub="Can't find something?" />
                        <DropItem to="/report/found" emoji="🎉" label="Found Item" sub="Found something?" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User avatar */}
                <div style={{ position: 'relative' }}>
                  <motion.button
                    whileHover={{ scale: 1.1, boxShadow: '0 4px 20px rgba(245,166,35,0.5)' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setDropOpen(d => !d)} /* Assuming dashboard drop opens contextually or later */
                    style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'linear-gradient(135deg,#f5a623,#ff7b3a)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#0a0a0f', fontFamily: 'var(--font-display)',
                      fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer',
                      boxShadow: '0 2px 12px rgba(245,166,35,0.35)',
                    }}
                  >
                    {user?.username?.[0]?.toUpperCase()}
                  </motion.button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: 'var(--bg-hover)', color: 'var(--accent-danger)' }}
                  onClick={handleLogout}
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '8px 12px' }}
                >
                  <LogOut size={16} />
                </motion.button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              className="btn btn-ghost btn-icon mobile-menu-btn"
              onClick={() => setMenuOpen(m => !m)}
              style={{ display: 'none' }}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              background: 'var(--bg-elevated)', borderTop: '1px solid var(--border-subtle)',
              padding: '16px 24px 24px', overflow: 'hidden'
            }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <MobileNavLink to="/items" label="🔍 Browse Items" />
              {isAuth && <>
                <MobileNavLink to="/my-reports" label="📋 My Reports" />
                <MobileNavLink to="/analytics" label="📊 Analytics" />
                <MobileNavLink to="/report/lost" label="😢 Report Lost" />
                <MobileNavLink to="/report/found" label="🎉 Report Found" />
              </>}
              {isAdmin && <MobileNavLink to="/admin" label="⚡ Admin" />}
              {!isAuth && <>
                <MobileNavLink to="/login" label="Sign In" />
                <MobileNavLink to="/register" label="Get Started" />
              </>}
              {isAuth && (
                <button onClick={handleLogout} style={{
                  textAlign: 'left', padding: '12px 16px', borderRadius: 'var(--r-md)',
                  color: 'var(--accent-danger)', background: 'rgba(239,68,68,0.08)',
                  border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)',
                  fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, marginTop: 8,
                }}>
                  <LogOut size={16} /> Sign Out
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media(max-width:768px){
          .desktop-nav{display:none!important}
          .mobile-menu-btn{display:flex!important}
        }
      `}</style>
    </motion.nav>
  )
}

function NavLink({ to, icon, label }) {
  const { pathname } = useLocation()
  const active = pathname === to || pathname.startsWith(to + '/')
  return (
    <Link to={to} style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '8px 14px', borderRadius: 'var(--r-full)',
      fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14,
      color: active ? 'var(--accent-gold)' : 'var(--text-secondary)',
      background: active ? 'rgba(245,166,35,0.1)' : 'transparent',
      transition: 'all 0.2s', textDecoration: 'none'
    }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-hover)' } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent' } }}
    >
      <motion.span whileHover={{ scale: 1.2, rotate: 5 }} style={{ fontSize: 16 }}>{icon}</motion.span>
      {label}
    </Link>
  )
}

function MobileNavLink({ to, label }) {
  return (
    <Link to={to} style={{
      padding: '12px 16px', borderRadius: 'var(--r-md)',
      color: 'var(--text-primary)', fontSize: 15,
      transition: 'background 0.15s', textDecoration: 'none'
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >{label}</Link>
  )
}

function DropItem({ to, emoji, label, sub }) {
  const navigate = useNavigate()
  return (
    <motion.button
      whileHover={{ scale: 1.02, backgroundColor: 'var(--bg-hover)', x: 4 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate(to)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 12px', borderRadius: 'var(--r-md)',
        background: 'transparent', border: 'none', cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <span style={{ fontSize: 22 }}>{emoji}</span>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{sub}</div>
      </div>
    </motion.button>
  )
}
