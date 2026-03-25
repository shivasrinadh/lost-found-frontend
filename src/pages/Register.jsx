import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, User, Mail, Phone, ArrowRight, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const PERKS = [
  { emoji:'📋', text:'Report lost & found items' },
  { emoji:'🔔', text:'Get matched instantly' },
  { emoji:'🤝', text:'Claim items securely' },
  { emoji:'⚡', text:'Campus-wide reach' },
]

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username:'', email:'', password:'', phone:'' })
  const [show, setShow]     = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const pwStrength = () => {
    const p = form.password
    if (!p) return 0
    let s = 0
    if (p.length >= 6)  s++
    if (p.length >= 10) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return Math.min(s, 4)
  }

  const strengthColors = ['', '#ef4444','#f5a623','#4f8ef7','#22c55e']
  const strengthLabels = ['','Weak','Fair','Good','Strong']

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.email || !form.password) { toast.error('Please fill required fields'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register(form)
      toast.success('Account created! Welcome to FindIt 🎉')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  const strength = pwStrength()

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      padding:'100px 24px 40px',
      background:'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(245,166,35,0.07) 0%, transparent 60%)',
    }}>
      <div style={{ width:'100%', maxWidth:920, display:'grid', gridTemplateColumns:'1fr 1fr', gap:32, animation:'fadeUp 0.5s var(--ease-out) both' }}>

        {/* Left: perks */}
        <div style={{ display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 24px' }}>
          <div style={{
            width:56, height:56, borderRadius:16, background:'linear-gradient(135deg,#f5a623,#ff7b3a)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:'var(--font-display)', fontWeight:800, fontSize:28, color:'#0a0a0f',
            boxShadow:'0 8px 32px rgba(245,166,35,0.4)', marginBottom:28,
          }}>F</div>
          <h1 style={{ fontSize:'clamp(1.8rem,3vw,2.6rem)', fontWeight:800, lineHeight:1.1, marginBottom:16 }}>
            Join the campus<br/>
            <span style={{ background:'var(--grad-gold)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              recovery network
            </span>
          </h1>
          <p style={{ color:'var(--text-secondary)', fontSize:15, lineHeight:1.7, marginBottom:36 }}>
            Thousands of students have already recovered their lost items. Join FindIt today.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {PERKS.map((p, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap:14,
                animation:`fadeUp 0.5s ${i*0.08+0.2}s var(--ease-out) both`,
              }}>
                <div style={{
                  width:40, height:40, borderRadius:12, background:'var(--bg-elevated)',
                  border:'1px solid var(--border-subtle)',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0,
                }}>{p.emoji}</div>
                <span style={{ color:'var(--text-secondary)', fontSize:14 }}>{p.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: form */}
        <div style={{
          background:'var(--bg-elevated)', border:'1px solid var(--border-subtle)',
          borderRadius:'var(--r-xl)', padding:36, boxShadow:'0 32px 80px rgba(0,0,0,0.4)',
        }}>
          <h2 style={{ fontSize:22, fontWeight:700, marginBottom:6 }}>Create your account</h2>
          <p style={{ color:'var(--text-secondary)', fontSize:14, marginBottom:28 }}>Free forever. No credit card needed.</p>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <div className="input-group">
              <label className="input-label">Username <span style={{ color:'var(--accent-danger)' }}>*</span></label>
              <div className="input-field-icon relative">
                <span className="icon"><User size={16}/></span>
                <input className="input-field" value={form.username} onChange={set('username')} placeholder="coolstudent42" autoFocus />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Email <span style={{ color:'var(--accent-danger)' }}>*</span></label>
              <div className="input-field-icon relative">
                <span className="icon"><Mail size={16}/></span>
                <input className="input-field" type="email" value={form.email} onChange={set('email')} placeholder="you@campus.edu" />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password <span style={{ color:'var(--accent-danger)' }}>*</span></label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', pointerEvents:'none' }}>
                  <Lock size={16}/>
                </span>
                <input
                  className="input-field" type={show ? 'text':'password'}
                  value={form.password} onChange={set('password')} placeholder="Min. 6 characters"
                  style={{ paddingLeft:46, paddingRight:46 }}
                />
                <button type="button" onClick={() => setShow(s => !s)} style={{
                  position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)',
                  display:'flex', alignItems:'center',
                }}>
                  {show ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
              {form.password && (
                <div style={{ marginTop:8 }}>
                  <div style={{ display:'flex', gap:4, marginBottom:4 }}>
                    {[1,2,3,4].map(n => (
                      <div key={n} style={{
                        flex:1, height:3, borderRadius:2,
                        background: n <= strength ? strengthColors[strength] : 'var(--border-subtle)',
                        transition:'background 0.3s',
                      }}/>
                    ))}
                  </div>
                  <span style={{ fontSize:11, color: strengthColors[strength] }}>
                    {strengthLabels[strength]}
                  </span>
                </div>
              )}
            </div>

            <div className="input-group">
              <label className="input-label">Phone <span style={{ color:'var(--text-muted)', fontWeight:400 }}>(optional)</span></label>
              <div className="input-field-icon relative">
                <span className="icon"><Phone size={16}/></span>
                <input className="input-field" type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
              </div>
            </div>

            <button
              type="submit" className="btn btn-primary btn-full"
              style={{ padding:'14px 24px', borderRadius:'var(--r-lg)', fontSize:15, marginTop:4 }}
              disabled={loading}
            >
              {loading ? (
                <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span className="spinner" style={{ width:18, height:18, borderWidth:2 }}/>Creating account…
                </span>
              ) : <>Create Account <ArrowRight size={16}/></>}
            </button>
          </form>

          <div style={{ marginTop:20, paddingTop:20, borderTop:'1px solid var(--border-subtle)', textAlign:'center' }}>
            <p style={{ color:'var(--text-secondary)', fontSize:14 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color:'var(--accent-gold)', fontWeight:600 }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`@media(max-width:768px){ .register-grid { grid-template-columns:1fr!important } .register-left { display:none!important } }`}</style>
    </div>
  )
}
