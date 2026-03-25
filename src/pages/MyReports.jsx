import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FileText, ClipboardList, TrendingUp, Eye } from 'lucide-react'
import { itemService } from '../services/itemService'
import { useAuth } from '../context/AuthContext'
import ItemCard from '../components/ItemCard'
import { format } from 'date-fns'

const TABS = [
  { id:'items',  emoji:'📋', label:'My Reports' },
  { id:'claims', emoji:'🙋', label:'My Claims' },
]

export default function MyReports() {
  const { user } = useAuth()
  const [tab, setTab]         = useState('items')
  const [items,  setItems]    = useState([])
  const [claims, setClaims]   = useState([])
  const [loading, setLoading] = useState(true)
  const [stats,  setStats]    = useState({ total:0, lost:0, found:0, claimed:0 })

  useEffect(() => {
    setLoading(true)
    Promise.all([
      itemService.getMine({ size:50, page:0 }),
      itemService.getMyClaims({ size:50, page:0 }),
    ]).then(([itemsRes, claimsRes]) => {
      const its = itemsRes.content || []
      setItems(its)
      setClaims(claimsRes.content || [])
      setStats({
        total:   its.length,
        lost:    its.filter(i => i.type === 'LOST').length,
        found:   its.filter(i => i.type === 'FOUND').length,
        claimed: its.filter(i => i.status === 'CLAIMED').length,
      })
    }).catch(() => {})
    .finally(() => setLoading(false))
  }, [])

  const STAT_CARDS = [
    { emoji:'📋', label:'Total Reports', value:stats.total, color:'var(--accent-cool)' },
    { emoji:'😢', label:'Lost Reports',  value:stats.lost,  color:'#f87171' },
    { emoji:'🎉', label:'Found Reports', value:stats.found, color:'#4ade80' },
    { emoji:'✅', label:'Reunited',      value:stats.claimed,color:'var(--accent-gold)' },
  ]

  return (
    <div className="page">
      <div className="container">

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:36 }}>
          <div>
            <div style={{
              display:'inline-flex', alignItems:'center', gap:10,
              background:'rgba(245,166,35,0.1)', border:'1px solid rgba(245,166,35,0.2)',
              borderRadius:'var(--r-full)', padding:'5px 14px', fontSize:13,
              color:'var(--accent-gold)', fontWeight:600, marginBottom:12,
            }}>
              <span style={{
                width:28, height:28, borderRadius:'50%', background:'var(--grad-gold)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily:'var(--font-display)', fontWeight:800, fontSize:13, color:'#0a0a0f',
              }}>
                {user?.username?.[0]?.toUpperCase()}
              </span>
              {user?.username}
            </div>
            <h1 style={{ fontSize:'clamp(1.6rem,3vw,2.2rem)', fontWeight:800 }}>My Dashboard</h1>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <Link to="/report/lost"  className="btn btn-outline btn-sm">😢 Report Lost</Link>
            <Link to="/report/found" className="btn btn-primary btn-sm"><Plus size={15}/> Report Found</Link>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:36 }}>
          {STAT_CARDS.map((s, i) => (
            <div key={i} style={{
              background:'var(--bg-elevated)', border:'1px solid var(--border-subtle)',
              borderRadius:'var(--r-lg)', padding:'20px 24px',
              animation:`fadeUp 0.4s ${i*0.08}s var(--ease-out) both`,
              transition:'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.borderColor='var(--border-normal)' }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor='var(--border-subtle)' }}
            >
              <div style={{ fontSize:28, marginBottom:10 }}>{s.emoji}</div>
              <div style={{
                fontFamily:'var(--font-display)', fontWeight:800, fontSize:32,
                color: s.color, lineHeight:1,
              }}>{s.value}</div>
              <div style={{ color:'var(--text-secondary)', fontSize:13, marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{
          display:'flex', gap:4, marginBottom:28,
          background:'var(--bg-elevated)', border:'1px solid var(--border-subtle)',
          borderRadius:'var(--r-lg)', padding:4, width:'fit-content',
        }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display:'flex', alignItems:'center', gap:8,
              padding:'10px 20px', borderRadius:'var(--r-md)', border:'none', cursor:'pointer',
              background: tab === t.id ? 'var(--grad-gold)':'transparent',
              color: tab === t.id ? '#0a0a0f':'var(--text-secondary)',
              fontFamily:'var(--font-display)', fontWeight:700, fontSize:14,
              transition:'all 0.2s',
            }}>
              <span>{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="loading-center"><div className="spinner"/></div>
        ) : tab === 'items' ? (
          items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon" style={{ fontSize:36 }}>📭</div>
              <h3>No reports yet</h3>
              <p>You haven't reported any lost or found items yet.</p>
              <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
                <Link to="/report/lost"  className="btn btn-outline">Report Lost</Link>
                <Link to="/report/found" className="btn btn-primary">Report Found</Link>
              </div>
            </div>
          ) : (
            <div className="grid-auto">
              {items.map((item, i) => <ItemCard key={item.id} item={item} delay={i*50}/>)}
            </div>
          )
        ) : (
          claims.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon" style={{ fontSize:36 }}>🙋</div>
              <h3>No claims yet</h3>
              <p>You haven't claimed any items yet. Browse items to find yours.</p>
              <Link to="/items" className="btn btn-primary">Browse Items</Link>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {claims.map((claim, i) => <MyClaim key={claim.id} claim={claim} delay={i*50}/>)}
            </div>
          )
        )}
      </div>

      <style>{`@media(max-width:768px){ .dashboard-stats { grid-template-columns:repeat(2,1fr)!important } }`}</style>
    </div>
  )
}

function MyClaim({ claim, delay }) {
  const statusConfig = {
    PENDING:  { color:'var(--accent-gold)', bg:'rgba(245,166,35,0.08)', border:'rgba(245,166,35,0.2)', icon:'⏳' },
    APPROVED: { color:'#4ade80',            bg:'rgba(34,197,94,0.08)',  border:'rgba(34,197,94,0.2)', icon:'✅' },
    REJECTED: { color:'#f87171',            bg:'rgba(239,68,68,0.08)', border:'rgba(239,68,68,0.2)', icon:'❌' },
  }
  const cfg = statusConfig[claim.status] || statusConfig.PENDING

  return (
    <div style={{
      background:'var(--bg-elevated)', border:'1px solid var(--border-subtle)',
      borderRadius:'var(--r-lg)', padding:'20px 24px',
      display:'flex', alignItems:'center', gap:16,
      animation:`fadeUp 0.4s ${delay}ms var(--ease-out) both`,
      transition:'all 0.2s',
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor='var(--border-normal)'}
    onMouseLeave={e => e.currentTarget.style.borderColor='var(--border-subtle)'}
    >
      <div style={{
        fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:5,
        padding:'5px 12px', borderRadius:'var(--r-full)',
        background:cfg.bg, border:`1px solid ${cfg.border}`, color:cfg.color,
        flexShrink:0,
      }}>
        {cfg.icon} {claim.status}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15 }}>
          {claim.itemTitle}
        </div>
        <div style={{ color:'var(--text-muted)', fontSize:12, marginTop:2 }}>
          Claimed {claim.claimedAt ? format(new Date(claim.claimedAt), 'PPP') : ''}
        </div>
        {claim.adminNote && (
          <div style={{ marginTop:6, fontSize:12, color:'#7bb3ff' }}>
            Admin: {claim.adminNote}
          </div>
        )}
      </div>
      <Link to={`/items/${claim.itemId}`} className="btn btn-ghost btn-sm" style={{ flexShrink:0 }}>
        <Eye size={15}/> View Item
      </Link>
    </div>
  )
}
