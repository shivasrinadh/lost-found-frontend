import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapPin, Calendar, User, Tag, ArrowLeft, CheckCircle, XCircle, Clock, Send, Trash2, Edit } from 'lucide-react'
import { itemService } from '../services/itemService'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const CATEGORY_EMOJIS = { ELECTRONICS: '📱', CLOTHING: '👔', ACCESSORIES: '💍', BOOKS: '📚', KEYS: '🔑', WALLET: '👛', BAGS: '🎒', SPORTS: '⚽', DOCUMENTS: '📄', JEWELRY: '💎', OTHER: '📦' }

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
  || claim.image_file_url
  || claim.image_path
  || claim.attachments?.image
  || claim.attachments?.imagePath
)

export default function ItemDetails() {
  const { id } = useParams()
  const { isAuth, isAdmin, user } = useAuth()
  const navigate = useNavigate()

  const [item, setItem] = useState(null)
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [claimModal, setClaimModal] = useState(false)
  const [proof, setProof] = useState('')
  const [documentFile, setDocumentFile] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([
      itemService.getById(id),
      isAuth ? itemService.getClaimsForItem(id).catch(() => []) : Promise.resolve([]),
    ]).then(([item, claims]) => {
      setItem(item); setClaims(claims)
    }).catch(() => navigate('/items'))
      .finally(() => setLoading(false))
  }, [id])

  const handleClaim = async () => {
    if (!proof.trim()) { toast.error('Please describe how you can prove ownership'); return }
    setSubmitting(true)
    try {
      await itemService.submitClaim({
        itemId: Number(id),
        proofDescription: proof,
        document: documentFile,
        image: imageFile,
      })
      toast.success('Claim submitted! 🎉')
      setClaimModal(false)
      setProof('')
      setDocumentFile(null)
      setImageFile(null)
      setImagePreview('')
      const updated = await itemService.getClaimsForItem(id)
      setClaims(updated)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit claim')
    } finally { setSubmitting(false) }
  }

  const closeClaimModal = () => {
    setClaimModal(false)
    setProof('')
    setDocumentFile(null)
    setImageFile(null)
    setImagePreview('')
  }

  const handleDocumentChange = (e) => {
    const file = e.target.files?.[0] || null
    setDocumentFile(file)
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null
    if (!file) {
      setImageFile(null)
      setImagePreview('')
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      e.target.value = ''
      setImageFile(null)
      setImagePreview('')
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleDelete = async () => {
    if (!confirm('Delete this item? This cannot be undone.')) return
    try {
      await itemService.remove(id)
      toast.success('Item deleted')
      navigate('/items')
    } catch { toast.error('Failed to delete') }
  }

  const handleResolve = async (claimId, status) => {
    try {
      await itemService.resolveClaim(claimId, { status })
      toast.success(`Claim ${status.toLowerCase()}`)
      const [updatedItem, updatedClaims] = await Promise.all([
        itemService.getById(id),
        itemService.getClaimsForItem(id),
      ])
      setItem(updatedItem); setClaims(updatedClaims)
    } catch { toast.error('Failed to resolve claim') }
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>
  if (!item) return null

  const emoji = CATEGORY_EMOJIS[item.category] || '📦'
  const isOwner = user?.id === item.reportedById
  const isLost = item.type === 'LOST'
  const canClaim = isAuth && !isOwner && item.status === 'OPEN'
  const alreadyClaimed = claims.some(c => c.claimedById === user?.id)

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 880 }}>

        {/* Back */}
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 24, gap: 6 }}>
          <ArrowLeft size={16} /> Back
        </button>

        {/* Main card */}
        <div style={{
          background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--r-xl)', overflow: 'hidden',
          animation: 'fadeUp 0.4s var(--ease-out)',
        }}>
          {/* Accent bar */}
          <div style={{
            height: 4, background: isLost
              ? 'linear-gradient(90deg,#ef4444,#ff7b3a)'
              : 'linear-gradient(90deg,#22c55e,#4f8ef7)',
          }} />

          <div style={{ padding: '36px 40px' }}>
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

              {/* Emoji bubble */}
              <div style={{
                width: 80, height: 80, borderRadius: 20, background: 'var(--bg-overlay)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 42, flexShrink: 0, border: '1px solid var(--border-subtle)',
              }}>{emoji}</div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                  <span className={`badge badge-${item.type.toLowerCase()}`} style={{ fontSize: 12 }}>
                    {isLost ? '😢 Lost' : '🎉 Found'}
                  </span>
                  <span className={`badge badge-${item.status.toLowerCase()}`} style={{ fontSize: 12 }}>
                    {item.status === 'OPEN' ? '🟢 Open' : item.status === 'CLAIMED' ? '✅ Claimed' : '🔒 Closed'}
                  </span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--r-full)', padding: '4px 10px', fontSize: 11,
                    color: 'var(--text-secondary)',
                  }}>
                    <Tag size={11} /> {item.category}
                  </span>
                </div>
                <h1 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, marginBottom: 8 }}>{item.title}</h1>
              </div>

              {/* Owner/Admin actions */}
              {(isOwner || isAdmin) && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleDelete} className="btn btn-danger btn-sm" title="Delete item">
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </div>

            {item.description && (
              <p style={{
                color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.8,
                marginTop: 24, padding: '20px 24px',
                background: 'var(--bg-overlay)', borderRadius: 'var(--r-md)',
                border: '1px solid var(--border-subtle)',
              }}>{item.description}</p>
            )}

            {/* Meta grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginTop: 24 }}>
              <MetaCard emoji="📍" label="Location" value={item.location} />
              <MetaCard emoji="👤" label="Reported by" value={item.reportedByUsername || 'Anonymous'} />
              {item.dateOccurred && <MetaCard emoji="📅" label="Date occurred" value={format(new Date(item.dateOccurred), 'PPP')} />}
              <MetaCard emoji="🕐" label="Reported on" value={item.createdAt ? format(new Date(item.createdAt), 'PPP') : '—'} />
            </div>

            {/* Claim action */}
            <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border-subtle)' }}>
              {!isAuth ? (
                <div style={{
                  padding: '20px 24px', background: 'rgba(79,142,247,0.08)',
                  border: '1px solid rgba(79,142,247,0.2)', borderRadius: 'var(--r-lg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>Is this yours?</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Sign in to submit a claim for this item.</div>
                  </div>
                  <Link to="/login" className="btn btn-primary btn-sm">Sign In</Link>
                </div>
              ) : alreadyClaimed ? (
                <div style={{
                  padding: '16px 20px', background: 'rgba(34,197,94,0.08)',
                  border: '1px solid rgba(34,197,94,0.2)', borderRadius: 'var(--r-lg)',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <CheckCircle size={18} style={{ color: 'var(--accent-success)' }} />
                  <span style={{ color: 'var(--accent-success)', fontWeight: 600 }}>You've already submitted a claim for this item.</span>
                </div>
              ) : canClaim ? (
                <button onClick={() => setClaimModal(true)} className="btn btn-primary" style={{ gap: 8 }}>
                  🙋 This is Mine — Submit Claim
                </button>
              ) : isOwner ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>📋 This is your reported item.</div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Claims section (owner or admin) */}
        {(isOwner || isAdmin) && claims.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
              🙋 Claims ({claims.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {claims.map((claim, i) => (
                <ClaimCard key={claim.id} claim={claim} onResolve={handleResolve} isAdmin={isAdmin} delay={i * 60} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Claim modal */}
      {claimModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          backdropFilter: 'blur(8px)', animation: 'fadeIn 0.2s',
        }}
          onClick={e => { if (e.target === e.currentTarget) closeClaimModal() }}
        >
          <div style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border-normal)',
            borderRadius: 'var(--r-xl)', width: '100%', maxWidth: 500,
            boxShadow: 'var(--shadow-lg)', animation: 'scaleIn 0.2s var(--ease-spring)',
            display: 'flex', flexDirection: 'column', maxHeight: '90vh',
          }}>
            <div style={{ padding: 36, paddingBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 16, textAlign: 'center' }}>🙋</div>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>Submit a Claim</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 0, textAlign: 'center' }}>
                Describe how you can prove this item belongs to you.
              </p>
            </div>

            <div style={{ padding: '0 36px', overflow: 'auto', flex: 1 }}>
              <div className="input-group" style={{ marginBottom: 24 }}>
                <label className="input-label">Proof of Ownership *</label>
                <textarea
                  className="textarea-field"
                  value={proof} onChange={e => setProof(e.target.value)}
                  placeholder="e.g. The bag has a red keychain and my name written inside the front pocket. I also have the purchase receipt from Amazon..."
                  style={{ minHeight: 140 }}
                  autoFocus
                />
              </div>

              <div className="input-group" style={{ marginBottom: 16 }}>
                <label className="input-label">Upload Supporting Document</label>
                <input
                  type="file"
                  onChange={handleDocumentChange}
                  accept=".pdf,.doc,.docx,.txt,.rtf,.odt"
                  className="input-field"
                  style={{ padding: '10px 12px' }}
                />
                {documentFile && (
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    📄 {documentFile.name}
                  </div>
                )}
              </div>

              <div className="input-group" style={{ marginBottom: 24 }}>
                <label className="input-label">Upload Image</label>
                <input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="input-field"
                  style={{ padding: '10px 12px' }}
                />
                {imageFile && (
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8 }}>
                    🖼️ {imageFile.name}
                  </div>
                )}
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Selected proof"
                    style={{
                      width: '100%',
                      maxHeight: 200,
                      objectFit: 'cover',
                      borderRadius: 'var(--r-md)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  />
                )}
              </div>
            </div>

            <div style={{ padding: '24px 36px 36px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 10 }}>
              <button onClick={closeClaimModal} className="btn btn-outline btn-full">Cancel</button>
              <button onClick={handleClaim} className="btn btn-primary btn-full" disabled={submitting}>
                {submitting ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Submitting…</> : <><Send size={16} /> Submit Claim</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MetaCard({ emoji, label, value }) {
  return (
    <div style={{
      background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--r-md)', padding: '14px 16px',
    }}>
      <div style={{ fontSize: 20, marginBottom: 4 }}>{emoji}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>{value}</div>
    </div>
  )
}

function ClaimCard({ claim, onResolve, isAdmin, delay }) {
  const statusConfig = {
    PENDING: { color: 'var(--accent-gold)', bg: 'rgba(245,166,35,0.08)', icon: '⏳', border: 'rgba(245,166,35,0.2)' },
    APPROVED: { color: 'var(--accent-success)', bg: 'rgba(34,197,94,0.08)', icon: '✅', border: 'rgba(34,197,94,0.2)' },
    REJECTED: { color: 'var(--accent-danger)', bg: 'rgba(239,68,68,0.08)', icon: '❌', border: 'rgba(239,68,68,0.2)' },
  }
  const cfg = statusConfig[claim.status] || statusConfig.PENDING
  const documentUrl = resolveDocumentUrl(claim)
  const imageUrl = resolveImageUrl(claim)

  return (
    <div style={{
      background: 'var(--bg-elevated)', border: `1px solid var(--border-subtle)`,
      borderRadius: 'var(--r-lg)', padding: '20px 24px',
      animation: `fadeUp 0.4s ${delay}ms var(--ease-out) both`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
            👤 {claim.claimedByUsername}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {claim.claimedAt ? format(new Date(claim.claimedAt), 'PPP p') : '—'}
          </div>
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px',
          borderRadius: 'var(--r-full)', background: cfg.bg, border: `1px solid ${cfg.border}`,
          color: cfg.color, fontSize: 12, fontWeight: 600,
        }}>
          {cfg.icon} {claim.status}
        </span>
      </div>

      <p style={{
        color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7,
        padding: '12px 16px', background: 'var(--bg-overlay)',
        borderRadius: 'var(--r-md)', marginBottom: isAdmin && claim.status === 'PENDING' ? 12 : 0,
      }}>{claim.proofDescription}</p>

      {(documentUrl || imageUrl) && (
        <div style={{ display: 'grid', gap: 10, marginTop: 12, marginBottom: isAdmin && claim.status === 'PENDING' ? 12 : 0 }}>
          {documentUrl && (
            <a
              href={documentUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                width: 'fit-content',
                color: '#7bb3ff',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              📄 View Uploaded Document
            </a>
          )}
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Claim proof"
              style={{
                width: '100%',
                maxWidth: 260,
                maxHeight: 150,
                objectFit: 'cover',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--border-subtle)',
              }}
            />
          )}
        </div>
      )}

      {claim.adminNote && (
        <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(79,142,247,0.08)', borderRadius: 'var(--r-sm)', fontSize: 13, color: 'var(--text-secondary)' }}>
          <span style={{ fontWeight: 600, color: '#7bb3ff' }}>Admin note: </span>{claim.adminNote}
        </div>
      )}

      {isAdmin && claim.status === 'PENDING' && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => onResolve(claim.id, 'APPROVED')} className="btn btn-sm" style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)' }}>
            <CheckCircle size={14} /> Approve
          </button>
          <button onClick={() => onResolve(claim.id, 'REJECTED')} className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
            <XCircle size={14} /> Reject
          </button>
        </div>
      )}
    </div>
  )
}
