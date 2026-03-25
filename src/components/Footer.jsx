import React from 'react'
import { Link } from 'react-router-dom'

const CATEGORIES = [
  { emoji:'📱', label:'Electronics' },
  { emoji:'👔', label:'Clothing' },
  { emoji:'💍', label:'Jewelry' },
  { emoji:'🔑', label:'Keys' },
  { emoji:'📚', label:'Books' },
  { emoji:'🎒', label:'Bags' },
]

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '60px 0 32px',
      position: 'relative', zIndex: 1,
    }}>
      <div className="container">
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap: 48, marginBottom: 48 }}>

          {/* Brand */}
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom: 16 }}>
              <div style={{
                width:36, height:36, borderRadius:10,
                background:'linear-gradient(135deg,#f5a623,#ff7b3a)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily:'var(--font-display)', fontWeight:800, fontSize:18, color:'#0a0a0f',
              }}>F</div>
              <span style={{
                fontFamily:'var(--font-display)', fontWeight:800, fontSize:20,
                background:'linear-gradient(135deg,#f0efe8,#9b9a94)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              }}>FindIt</span>
            </div>
            <p style={{ color:'var(--text-secondary)', fontSize:14, lineHeight:1.7, maxWidth:280 }}>
              The campus lost & found platform. Helping students reunite with their belongings since 2024.
            </p>
            <div style={{ display:'flex', gap:8, marginTop:20 }}>
              {CATEGORIES.map(c => (
                <span key={c.label} title={c.label} style={{
                  fontSize:20, cursor:'default',
                  transition:'transform 0.2s',
                  display:'inline-block',
                }}
                onMouseEnter={e => e.currentTarget.style.transform='scale(1.3) translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
                >{c.emoji}</span>
              ))}
            </div>
          </div>

          {/* Navigate */}
          <div>
            <h4 style={{ fontFamily:'var(--font-display)', fontSize:13, fontWeight:700,
              color:'var(--text-secondary)', letterSpacing:'0.08em',
              textTransform:'uppercase', marginBottom:16 }}>Navigate</h4>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                { to:'/items',       label:'Browse All Items' },
                { to:'/report/lost', label:'Report Lost Item' },
                { to:'/report/found',label:'Report Found Item' },
                { to:'/my-reports',  label:'My Reports' },
              ].map(l => (
                <Link key={l.to} to={l.to} style={{
                  color:'var(--text-secondary)', fontSize:14,
                  transition:'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color='var(--accent-gold)'}
                onMouseLeave={e => e.currentTarget.style.color='var(--text-secondary)'}
                >{l.label}</Link>
              ))}
            </div>
          </div>

          {/* Account */}
          <div>
            <h4 style={{ fontFamily:'var(--font-display)', fontSize:13, fontWeight:700,
              color:'var(--text-secondary)', letterSpacing:'0.08em',
              textTransform:'uppercase', marginBottom:16 }}>Account</h4>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                { to:'/login',    label:'Sign In' },
                { to:'/register', label:'Register' },
              ].map(l => (
                <Link key={l.to} to={l.to} style={{
                  color:'var(--text-secondary)', fontSize:14,
                  transition:'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color='var(--accent-gold)'}
                onMouseLeave={e => e.currentTarget.style.color='var(--text-secondary)'}
                >{l.label}</Link>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          borderTop:'1px solid var(--border-subtle)', paddingTop:24,
          display:'flex', alignItems:'center', justifyContent:'space-between',
        }}>
          <p style={{ color:'var(--text-muted)', fontSize:13 }}>
            © 2024 FindIt Campus. All rights reserved.
          </p>
          <p style={{ color:'var(--text-muted)', fontSize:13 }}>
            Built with ❤️ for the campus community
          </p>
        </div>
      </div>

      <style>{`@media(max-width:768px){footer .container > div:first-child{grid-template-columns:1fr!important}}`}</style>
    </footer>
  )
}
