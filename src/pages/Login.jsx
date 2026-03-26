import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, User, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]     = useState({ username:'', password:'' })
  const [show, setShow]     = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) { toast.error('Please fill all fields'); return }
    setLoading(true)
    try {
      await login(form)
      toast.success('Welcome back! 👋')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      padding:'100px 24px 40px',
      background:'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(245,166,35,0.07) 0%, transparent 60%)',
    }}>
      <div style={{ width:'100%', maxWidth:440, animation:'fadeUp 0.5s var(--ease-out) both' }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{
            width:56, height:56, borderRadius:16,
            background:'linear-gradient(135deg,#f5a623,#ff7b3a)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:'var(--font-display)', fontWeight:800, fontSize:28,
            color:'#0a0a0f', margin:'0 auto 20px',
            boxShadow:'0 8px 32px rgba(245,166,35,0.4)',
          }}>F</div>
          <h1 style={{ fontSize:28, fontWeight:800, marginBottom:8 }}>Welcome back</h1>
          <p style={{ color:'var(--text-secondary)', fontSize:15 }}>Sign in to your FindIt account</p>
        </div>

        {/* Form card */}
        <div style={{
          background:'var(--bg-elevated)', border:'1px solid var(--border-subtle)',
          borderRadius:'var(--r-xl)', padding:36,
          boxShadow:'0 32px 80px rgba(0,0,0,0.4)',
        }}>
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:20 }}>

            <div className="input-group">
              <label className="input-label">Username</label>
              <div className="input-field-icon relative">
                <span className="icon"><User size={16}/></span>
                <input
                  className="input-field" value={form.username}
                  onChange={set('username')} placeholder="your_username"
                  autoFocus
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div style={{ position:'relative' }}>
                <span style={{
                  position:'absolute', left:16, top:'50%', transform:'translateY(-50%)',
                  color:'var(--text-muted)', pointerEvents:'none',
                }}><Lock size={16}/></span>
                <input
                  className="input-field" type={show ? 'text':'password'}
                  value={form.password} onChange={set('password')}
                  placeholder="••••••••"
                  style={{ paddingLeft:46, paddingRight:46 }}
                />
                <button type="button" onClick={() => setShow(s => !s)} style={{
                  position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', cursor:'pointer',
                  color:'var(--text-muted)', display:'flex', alignItems:'center',
                  transition:'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color='var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}
                >
                  {show ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              style={{ marginTop:8, padding:'14px 24px', borderRadius:'var(--r-lg)', fontSize:15 }}
              disabled={loading}
            >
              {loading ? (
                <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span className="spinner" style={{ width:18, height:18, borderWidth:2 }}/>
                  Signing in…
                </span>
              ) : (
                <>Sign In <ArrowRight size={16}/></>
              )}
            </button>
          </form>

          <div style={{
            marginTop:24, paddingTop:24, borderTop:'1px solid var(--border-subtle)',
            textAlign:'center',
          }}>
            <p style={{ color:'var(--text-secondary)', fontSize:14 }}>
              Don't have an account?{' '}
              <Link to="/register" style={{
                color:'var(--accent-gold)', fontWeight:600,
                transition:'opacity 0.15s',
              }}>Create one free</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
