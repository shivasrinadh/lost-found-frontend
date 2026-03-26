import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, XCircle, Eye, RefreshCw, Users, Package, ClipboardList, TrendingUp, Zap } from 'lucide-react'
import { itemService } from '../services/itemService'
import toast from 'react-hot-toast'
import { format, formatDistanceToNow } from 'date-fns'

const TABS = [
  { id: 'overview', emoji: '⚡', label: 'Overview' },
  { id: 'items', emoji: '📦', label: 'All Items' },
  { id: 'claims', emoji: '🙋', label: 'Pending Claims' },
]

const STATUS_CFG = {
  PENDING: { color: 'var(--accent-gold)', bg: 'rgba(245,166,35,0.1)', border: 'rgba(245,166,35,0.25)', icon: '⏳' },
  APPROVED: { color: '#4ade80', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)', icon: '✅' },
  REJECTED: { color: '#f87171', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', icon: '❌' },
  OPEN: { color: '#7bb3ff', bg: 'rgba(79,142,247,0.1)', border: 'rgba(79,142,247,0.25)', icon: '🟢' },
  CLAIMED: { color: 'var(--accent-gold)', bg: 'rgba(245,166,35,0.1)', border: 'rgba(245,166,35,0.25)', icon: '✅' },
  CLOSED: { color: 'var(--text-muted)', bg: 'var(--bg-overlay)', border: 'var(--border-subtle)', icon: '🔒' },
}

const ASSET_BASE_URL = (import.meta.env.VITE_ASSET_BASE_URL || import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

const toAssetUrl = (value) => {
  if (!value) return ''

  const raw = typeof value === 'string'
    ? value
    : value?.url || value?.path || value?.href || ''

  if (!raw) return ''
  if (/^https?:\/\//i.test(raw)) return raw

  const normalized = raw.replace(/\\/g, '/')
  if (normalized.startsWith('/')) return `${ASSET_BASE_URL}${normalized}`
  return `${ASSET_BASE_URL}/${normalized}`
}

const resolveDocumentUrl = (claim) => toAssetUrl(
  claim.documentUrl
  || claim.documentURL
  || claim.document
  || claim.documentPath
  || claim.documentFileUrl
  || (claim.documentFileName ? `/uploads/documents/${claim.documentFileName}` : '')
  || (claim.documentName ? `/uploads/documents/${claim.documentName}` : '')
  || claim.document_file_url
  || claim.document_path
  || claim.attachments?.document
  || claim.attachments?.documentPath
)

const resolveImageUrl = (claim) => toAssetUrl(
  claim.imageUrl
  || claim.imageURL
  || claim.image
  || claim.imagePath
  || claim.imageFileUrl
  || (claim.imageFileName ? `/uploads/images/${claim.imageFileName}` : '')
  || (claim.imageName ? `/uploads/images/${claim.imageName}` : '')
  || claim.image_file_url
  || claim.image_path
  || claim.attachments?.image
  || claim.attachments?.imagePath
)

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview')
  const [items, setItems] = useState([])
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [resolving, setResolving] = useState(null)

  const load = async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true)
    try {
      const [itemsRes, claimsRes] = await Promise.all([
        itemService.getAll({ size: 100, page: 0 }),
        itemService.getAllClaims({ size: 100, page: 0 }),
      ])
      setItems(itemsRes.content || [])
      setClaims(claimsRes.content || [])
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false); setRefreshing(false) }
  }

  useEffect(() => { load() }, [])

  const handleResolve = async (claimId, status) => {
    setResolving(claimId + status)
    try {
      await itemService.resolveClaim(claimId, { status })
      toast.success(`Claim ${status.toLowerCase()} ✓`)
      await load(true)
    } catch { toast.error('Failed') }
    finally { setResolving(null) }
  }

  const pendingClaims = claims.filter(c => c.status === 'PENDING')
  const lostItems = items.filter(i => i.type === 'LOST')
  const foundItems = items.filter(i => i.type === 'FOUND')
  const claimedItems = items.filter(i => i.status === 'CLAIMED')
  const openItems = items.filter(i => i.status === 'OPEN')

  const OVERVIEW_STATS = [
    { emoji: '📦', label: 'Total Items', value: items.length, color: '#7bb3ff' },
    { emoji: '😢', label: 'Lost Reports', value: lostItems.length, color: '#f87171' },
    { emoji: '🎉', label: 'Found Reports', value: foundItems.length, color: '#4ade80' },
    { emoji: '🟢', label: 'Open Items', value: openItems.length, color: 'var(--accent-cool)' },
    { emoji: '✅', label: 'Claimed Items', value: claimedItems.length, color: 'var(--accent-gold)' },
    { emoji: '🙋', label: 'Pending Claims', value: pendingClaims.length, color: 'var(--accent-warm)' },
  ]

  return (
    <div className="page">
      <div className="container">

        {/* Header */}
        <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)',
              borderRadius: 'var(--r-full)', padding: '4px 12px', fontSize: 12, fontWeight: 700,
              color: 'var(--accent-gold)', letterSpacing: '0.08em', textTransform: 'uppercase',
              marginBottom: 10,
            }}>
              ⚡ Admin Panel
            </div>
            <h1 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 800 }}>Dashboard</h1>
          </div>
          <button
            onClick={() => load(true)}
            className="btn btn-outline btn-sm"
            disabled={refreshing}
            style={{ gap: 6 }}
          >
            <RefreshCw size={15} style={{ animation: refreshing ? 'spin 0.6s linear infinite' : '' }} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {/* Tabs */}
        <div className="admin-tabs" style={{
          display: 'flex', gap: 4, marginBottom: 32,
          background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--r-lg)', padding: 4, width: 'fit-content',
        }}>
          {TABS.map(t => {
            const badge = t.id === 'claims' ? pendingClaims.length : null
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                display: 'flex', alignItems: 'center', gap: 7, position: 'relative',
                padding: '10px 20px', borderRadius: 'var(--r-md)', border: 'none', cursor: 'pointer',
                background: tab === t.id ? 'var(--grad-gold)' : 'transparent',
                color: tab === t.id ? '#0a0a0f' : 'var(--text-secondary)',
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
                transition: 'all 0.2s',
              }}>
                <span>{t.emoji}</span> {t.label}
                {badge > 0 && (
                  <span style={{
                    position: 'absolute', top: 4, right: 4,
                    width: 18, height: 18, borderRadius: '50%',
                    background: '#ef4444', color: '#fff',
                    fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{badge}</span>
                )}
              </button>
            )
          })}
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : (
          <>
            {/* ── Overview ── */}
            {tab === 'overview' && (
              <div style={{ animation: 'fadeIn 0.3s' }}>
                <div className="admin-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 36 }}>
                  {OVERVIEW_STATS.map((s, i) => (
                    <div key={i} style={{
                      background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--r-lg)', padding: '24px',
                      animation: `fadeUp 0.4s ${i * 0.06}s var(--ease-out) both`,
                      transition: 'all 0.2s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'var(--border-normal)' }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
                    >
                      <div style={{ fontSize: 32, marginBottom: 10 }}>{s.emoji}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, color: s.color, lineHeight: 1 }}>{s.value}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 6 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Pending claims quick view */}
                {pendingClaims.length > 0 && (
                  <div style={{
                    background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.2)',
                    borderRadius: 'var(--r-xl)', padding: 24,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>
                        ⏳ {pendingClaims.length} Pending Claim{pendingClaims.length > 1 ? 's' : ''} Need Attention
                      </h3>
                      <button onClick={() => setTab('claims')} className="btn btn-outline btn-sm">View All</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {pendingClaims.slice(0, 3).map(c => (
                        <div key={c.id} className="admin-quick-claim" style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)', padding: '12px 16px',
                        }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, flex: 1 }}>
                            {c.itemTitle}
                          </span>
                          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>by {c.claimedByUsername}</span>
                          <div className="admin-quick-actions" style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => handleResolve(c.id, 'APPROVED')} disabled={!!resolving} style={{
                              padding: '5px 10px', borderRadius: 'var(--r-sm)', border: '1px solid rgba(34,197,94,0.3)',
                              background: 'rgba(34,197,94,0.1)', color: '#4ade80', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                            }}>✅ Approve</button>
                            <button onClick={() => handleResolve(c.id, 'REJECTED')} disabled={!!resolving} style={{
                              padding: '5px 10px', borderRadius: 'var(--r-sm)', border: '1px solid rgba(239,68,68,0.3)',
                              background: 'rgba(239,68,68,0.1)', color: '#f87171', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                            }}>❌ Reject</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Items table ── */}
            {tab === 'items' && (
              <div style={{ animation: 'fadeIn 0.3s' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px' }}>
                    <thead>
                      <tr>
                        {['Item', 'Type', 'Status', 'Location', 'Reported By', 'Date'].map(h => (
                          <th key={h} style={{
                            textAlign: 'left', padding: '8px 16px',
                            fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                            color: 'var(--text-muted)', textTransform: 'uppercase',
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, i) => {
                        const sc = STATUS_CFG[item.status] || STATUS_CFG.OPEN
                        return (
                          <tr key={item.id} style={{ animation: `fadeUp 0.3s ${i * 0.03}s var(--ease-out) both` }}>
                            {[
                              <td key="t" style={{ padding: '0 6px' }}>
                                <Link to={`/items/${item.id}`} style={{
                                  display: 'flex', alignItems: 'center', gap: 10,
                                  padding: '12px 16px', background: 'var(--bg-elevated)',
                                  border: '1px solid var(--border-subtle)',
                                  borderRadius: 'var(--r-md) 0 0 var(--r-md)',
                                  color: 'var(--text-primary)', textDecoration: 'none',
                                  fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14,
                                  whiteSpace: 'nowrap', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis',
                                }}>
                                  <span style={{ fontSize: 18 }}>
                                    {{ ELECTRONICS: '📱', CLOTHING: '👔', BAGS: '🎒', BOOKS: '📚', KEYS: '🔑', WALLET: '👛', DOCUMENTS: '📄', JEWELRY: '💎', OTHER: '📦', SPORTS: '⚽', ACCESSORIES: '💍' }[item.category] || '📦'}
                                  </span>
                                  {item.title}
                                </Link>
                              </td>,
                              <td key="ty" style={{ padding: '0 6px' }}>
                                <div style={{
                                  padding: '12px 16px', background: 'var(--bg-elevated)',
                                  border: '1px solid var(--border-subtle)', borderLeft: 'none',
                                }}>
                                  <span className={`badge badge-${item.type.toLowerCase()}`} style={{ fontSize: 10 }}>
                                    {item.type === 'LOST' ? '😢 Lost' : '🎉 Found'}
                                  </span>
                                </div>
                              </td>,
                              <td key="st" style={{ padding: '0 6px' }}>
                                <div style={{ padding: '12px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderLeft: 'none' }}>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 'var(--r-full)', background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color, fontSize: 10, fontWeight: 600 }}>
                                    {sc.icon} {item.status}
                                  </span>
                                </div>
                              </td>,
                              <td key="lo" style={{ padding: '0 6px' }}>
                                <div style={{ padding: '12px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderLeft: 'none', color: 'var(--text-secondary)', fontSize: 13 }}>
                                  📍 {item.location}
                                </div>
                              </td>,
                              <td key="by" style={{ padding: '0 6px' }}>
                                <div style={{ padding: '12px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderLeft: 'none', color: 'var(--text-secondary)', fontSize: 13 }}>
                                  👤 {item.reportedByUsername}
                                </div>
                              </td>,
                              <td key="dt" style={{ padding: '0 6px' }}>
                                <div style={{ padding: '12px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderLeft: 'none', borderRadius: '0 var(--r-md) var(--r-md) 0', color: 'var(--text-muted)', fontSize: 12 }}>
                                  {item.createdAt ? format(new Date(item.createdAt), 'MMM d') : '—'}
                                </div>
                              </td>,
                            ]}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Claims tab ── */}
            {tab === 'claims' && (
              <div style={{ animation: 'fadeIn 0.3s' }}>
                {claims.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon" style={{ fontSize: 36 }}>🙋</div>
                    <h3>No claims yet</h3>
                    <p>Claims will appear here when users submit them.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {claims.map((claim, i) => {
                      const cfg = STATUS_CFG[claim.status] || STATUS_CFG.PENDING
                      const documentUrl = resolveDocumentUrl(claim)
                      const imageUrl = resolveImageUrl(claim)
                      return (
                        <div key={claim.id} style={{
                          background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--r-lg)', padding: '20px 24px',
                          animation: `fadeUp 0.3s ${i * 0.04}s var(--ease-out) both`,
                        }}>
                          <div className="admin-claim-row" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px',
                                  borderRadius: 'var(--r-full)', background: cfg.bg, border: `1px solid ${cfg.border}`,
                                  color: cfg.color, fontSize: 11, fontWeight: 700,
                                }}>
                                  {cfg.icon} {claim.status}
                                </span>
                                <Link to={`/items/${claim.itemId}`} style={{
                                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
                                  color: 'var(--text-primary)', transition: 'color 0.15s',
                                }}
                                  onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-gold)'}
                                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}
                                >{claim.itemTitle}</Link>
                              </div>
                              <div style={{ display: 'flex', gap: 16, marginBottom: 10, flexWrap: 'wrap' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>👤 <b style={{ color: 'var(--text-secondary)' }}>{claim.claimedByUsername}</b></span>
                                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                                  🕐 {claim.claimedAt ? formatDistanceToNow(new Date(claim.claimedAt), { addSuffix: true }) : '—'}
                                </span>
                              </div>
                              <p style={{
                                color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.7,
                                padding: '10px 14px', background: 'var(--bg-overlay)', borderRadius: 'var(--r-sm)',
                              }}>{claim.proofDescription}</p>

                              {!documentUrl && !imageUrl && (
                                <div style={{ marginTop: 8, color: 'var(--text-muted)', fontSize: 11 }}>
                                  No attachment paths returned for this claim.
                                </div>
                              )}

                              {(documentUrl || imageUrl) && (
                                <div style={{
                                  marginTop: 10,
                                  padding: '12px 14px',
                                  background: 'var(--bg-overlay)',
                                  borderRadius: 'var(--r-sm)',
                                  border: '1px solid var(--border-subtle)',
                                  display: 'grid',
                                  gap: 10,
                                }}>
                                  {documentUrl && (
                                    <a
                                      href={documentUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{ color: '#7bb3ff', fontSize: 13, fontWeight: 600, width: 'fit-content' }}
                                    >
                                      📄 View Uploaded Document
                                    </a>
                                  )}
                                  {imageUrl && (
                                    <img
                                      src={imageUrl}
                                      alt="Claim evidence"
                                      style={{
                                        width: '100%',
                                        maxWidth: 260,
                                        maxHeight: 160,
                                        objectFit: 'cover',
                                        borderRadius: 'var(--r-md)',
                                        border: '1px solid var(--border-subtle)',
                                      }}
                                    />
                                  )}
                                </div>
                              )}
                            </div>

                            {claim.status === 'PENDING' && (
                              <div className="admin-claim-actions" style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                                <button
                                  onClick={() => handleResolve(claim.id, 'APPROVED')}
                                  disabled={resolving === claim.id + 'APPROVED'}
                                  className="btn btn-sm"
                                  style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)' }}
                                >
                                  {resolving === claim.id + 'APPROVED' ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <CheckCircle size={15} />}
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleResolve(claim.id, 'REJECTED')}
                                  disabled={resolving === claim.id + 'REJECTED'}
                                  className="btn btn-sm"
                                  style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}
                                >
                                  {resolving === claim.id + 'REJECTED' ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <XCircle size={15} />}
                                  Reject
                                </button>
                                <Link to={`/items/${claim.itemId}`} className="btn btn-ghost btn-sm">
                                  <Eye size={15} /> View
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .admin-stats { grid-template-columns: repeat(2, 1fr) !important; }
        }

        @media (max-width: 768px) {
          .admin-header { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .admin-tabs { width: 100% !important; overflow-x: auto !important; }
          .admin-tabs button { white-space: nowrap !important; }
          .admin-stats { grid-template-columns: 1fr !important; }
          .admin-quick-claim { flex-direction: column !important; align-items: flex-start !important; }
          .admin-quick-actions { width: 100% !important; }
          .admin-quick-actions button { flex: 1 !important; }
          .admin-claim-row { flex-direction: column !important; }
          .admin-claim-actions { width: 100% !important; flex-direction: row !important; flex-wrap: wrap !important; }
          .admin-claim-actions > * { flex: 1 1 140px !important; justify-content: center !important; }
        }
      `}</style>
    </div>
  )
}
