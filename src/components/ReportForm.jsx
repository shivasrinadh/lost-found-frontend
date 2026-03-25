import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, FileText, Tag, ArrowRight, ArrowLeft } from 'lucide-react'
import { itemService } from '../services/itemService'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { value: 'ELECTRONICS', emoji: '📱', label: 'Electronics' },
  { value: 'CLOTHING', emoji: '👔', label: 'Clothing' },
  { value: 'ACCESSORIES', emoji: '💍', label: 'Accessories' },
  { value: 'BOOKS', emoji: '📚', label: 'Books' },
  { value: 'KEYS', emoji: '🔑', label: 'Keys' },
  { value: 'WALLET', emoji: '👛', label: 'Wallet' },
  { value: 'BAGS', emoji: '🎒', label: 'Bags' },
  { value: 'SPORTS', emoji: '⚽', label: 'Sports' },
  { value: 'DOCUMENTS', emoji: '📄', label: 'Documents' },
  { value: 'JEWELRY', emoji: '💎', label: 'Jewelry' },
  { value: 'OTHER', emoji: '📦', label: 'Other' },
]

const LOCATIONS = [
  'Main Library', 'Central Cafeteria', 'Sports Complex', 'Block A', 'Block B', 'Block C',
  'Admin Building', 'Hostel Block 1', 'Hostel Block 2', 'Parking Lot', 'Auditorium',
  'Computer Lab', 'Science Block', 'Art Block', 'Medical Center', 'Other',
]

export default function ReportForm({ type }) {
  const navigate = useNavigate()
  const isLost = type === 'LOST'
  const accentColor = isLost ? '#ef4444' : '#22c55e'

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    title: '', description: '', location: '', category: '',
    type, dateOccurred: '',
  })
  const [loading, setLoading] = useState(false)

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: typeof v === 'string' ? v : v.target.value }))

  const canStep2 = form.title && form.category
  const canStep3 = form.location

  const handleSubmit = async () => {
    if (!form.title || !form.category || !form.location) {
      toast.error('Please fill all required fields')
      return
    }
    setLoading(true)
    try {
      const payload = { ...form, dateOccurred: form.dateOccurred || null }
      const created = await itemService.create(payload)
      toast.success(`${isLost ? 'Lost item reported' : 'Found item reported'} successfully! 🎉`)
      navigate(`/items/${created.id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report')
    } finally { setLoading(false) }
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 660 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 56, marginBottom: 16, animation: 'float 3s ease-in-out infinite' }}>
            {isLost ? '😢' : '🎉'}
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 800, marginBottom: 8 }}>
            {isLost ? 'Report a Lost Item' : 'Report a Found Item'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            {isLost
              ? "Fill in the details and let the campus community help you find it."
              : "Help reunite someone with their belongings. Fill in what you found."}
          </p>
        </div>

        {/* Step progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 40 }}>
          {[
            { n: 1, label: 'Item Info' },
            { n: 2, label: 'Location' },
            { n: 3, label: 'Review' },
          ].map((s, i) => (
            <React.Fragment key={s.n}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: step >= s.n
                    ? `linear-gradient(135deg,${accentColor},${isLost ? '#ff7b3a' : '#4f8ef7'})`
                    : 'var(--bg-overlay)',
                  border: step < s.n ? '1px solid var(--border-subtle)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
                  color: step >= s.n ? '#fff' : 'var(--text-muted)',
                  transition: 'all 0.3s var(--ease-spring)',
                  boxShadow: step === s.n ? `0 4px 16px ${accentColor}40` : 'none',
                }}>{s.n}</div>
                <span style={{
                  fontSize: 11, marginTop: 6, fontWeight: 600, letterSpacing: '0.04em',
                  color: step >= s.n ? 'var(--text-primary)' : 'var(--text-muted)',
                }}>{s.label}</span>
              </div>
              {i < 2 && (
                <div style={{
                  flex: 2, height: 2, marginTop: -12,
                  background: step > s.n ? accentColor : 'var(--border-subtle)',
                  transition: 'background 0.4s',
                }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form card */}
        <div style={{
          background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--r-xl)', padding: 40, boxShadow: 'var(--shadow-md)',
          animation: 'fadeUp 0.4s var(--ease-out)',
        }}>

          {/* ── Step 1: Item Info ── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.3s' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>
                  Choose Category *
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(100px,1fr))', gap: 10 }}>
                  {CATEGORIES.map(c => (
                    <button key={c.value} onClick={() => set('category')(c.value)} style={{
                      padding: '12px 8px', borderRadius: 'var(--r-md)', cursor: 'pointer',
                      background: form.category === c.value ? `${accentColor}18` : 'var(--bg-overlay)',
                      border: form.category === c.value ? `1px solid ${accentColor}60` : '1px solid var(--border-subtle)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      transition: 'all 0.2s',
                      transform: form.category === c.value ? 'scale(1.04)' : 'scale(1)',
                    }}>
                      <span style={{ fontSize: 26 }}>{c.emoji}</span>
                      <span style={{
                        fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 600,
                        color: form.category === c.value ? accentColor : 'var(--text-secondary)',
                      }}>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Item Title *</label>
                <input
                  className="input-field" value={form.title}
                  onChange={set('title')}
                  placeholder={isLost ? "e.g. Black Laptop Bag" : "e.g. Found Blue Water Bottle"}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea
                  className="textarea-field" value={form.description}
                  onChange={set('description')}
                  placeholder={isLost
                    ? "Describe your item — color, brand, distinguishing features, what was inside…"
                    : "Describe what you found — color, brand, any identifiers…"}
                />
              </div>

              <button
                className="btn btn-primary btn-full"
                onClick={() => setStep(2)}
                disabled={!canStep2}
                style={{ padding: '14px', borderRadius: 'var(--r-lg)', fontSize: 15 }}
              >
                Continue <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* ── Step 2: Location ── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.3s' }}>
              <div className="input-group">
                <label className="input-label">📍 Location *</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                  {LOCATIONS.map(l => (
                    <button key={l} onClick={() => set('location')(l)} style={{
                      padding: '7px 14px', borderRadius: 'var(--r-full)', cursor: 'pointer',
                      background: form.location === l ? `${accentColor}18` : 'var(--bg-overlay)',
                      border: form.location === l ? `1px solid ${accentColor}50` : '1px solid var(--border-subtle)',
                      color: form.location === l ? accentColor : 'var(--text-secondary)',
                      fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)',
                      transition: 'all 0.15s',
                    }}>{l}</button>
                  ))}
                </div>
                <input
                  className="input-field" value={form.location}
                  onChange={set('location')} placeholder="Or type a custom location…"
                  style={{ marginTop: 8 }}
                />
              </div>

              <div className="input-group">
                <label className="input-label">📅 Date {isLost ? 'Lost' : 'Found'}</label>
                <input
                  type="date" className="input-field" value={form.dateOccurred}
                  onChange={set('dateOccurred')} max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep(1)} className="btn btn-outline" style={{ flex: 1 }}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button onClick={() => setStep(3)} disabled={!canStep3} className="btn btn-primary" style={{ flex: 2 }}>
                  Review Report <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Review ── */}
          {step === 3 && (
            <div style={{ animation: 'fadeIn 0.3s' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Review your report</h3>

              <div style={{
                background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--r-lg)', padding: 24, marginBottom: 28,
              }}>
                {/* Item type banner */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16,
                  padding: '6px 14px', borderRadius: 'var(--r-full)', fontSize: 13, fontWeight: 600,
                  background: isLost ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)',
                  border: isLost ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(34,197,94,0.25)',
                  color: isLost ? '#f87171' : '#4ade80',
                }}>
                  {isLost ? '😢 Lost Item' : '🎉 Found Item'}
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
                  <span style={{ fontSize: 32 }}>
                    {CATEGORIES.find(c => c.value === form.category)?.emoji || '📦'}
                  </span>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>{form.title}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{form.category}</div>
                  </div>
                </div>

                {form.description && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>{form.description}</p>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  <ReviewChip emoji="📍" text={form.location} />
                  {form.dateOccurred && <ReviewChip emoji="📅" text={form.dateOccurred} />}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep(2)} className="btn btn-outline" style={{ flex: 1 }}>
                  <ArrowLeft size={16} /> Edit
                </button>
                <button onClick={handleSubmit} className="btn btn-primary" disabled={loading} style={{ flex: 2, fontSize: 15 }}>
                  {loading
                    ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Submitting…</>
                    : <>{isLost ? '😢' : '🎉'} Submit Report</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ReviewChip({ emoji, text }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px',
      borderRadius: 'var(--r-full)', background: 'var(--bg-hover)',
      border: '1px solid var(--border-subtle)', fontSize: 13, color: 'var(--text-secondary)',
    }}>
      <span>{emoji}</span>{text}
    </div>
  )
}
