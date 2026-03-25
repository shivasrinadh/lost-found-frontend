import React, { useState } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'

const CATEGORIES = [
  { value:'',            emoji:'🌐', label:'All' },
  { value:'ELECTRONICS', emoji:'📱', label:'Electronics' },
  { value:'CLOTHING',    emoji:'👔', label:'Clothing' },
  { value:'ACCESSORIES', emoji:'💍', label:'Accessories' },
  { value:'BOOKS',       emoji:'📚', label:'Books' },
  { value:'KEYS',        emoji:'🔑', label:'Keys' },
  { value:'WALLET',      emoji:'👛', label:'Wallet' },
  { value:'BAGS',        emoji:'🎒', label:'Bags' },
  { value:'SPORTS',      emoji:'⚽', label:'Sports' },
  { value:'DOCUMENTS',   emoji:'📄', label:'Docs' },
  { value:'JEWELRY',     emoji:'💎', label:'Jewelry' },
  { value:'OTHER',       emoji:'📦', label:'Other' },
]

export default function SearchBar({ onSearch, initialValues = {} }) {
  const [keyword,  setKeyword]  = useState(initialValues.keyword  || '')
  const [type,     setType]     = useState(initialValues.type     || '')
  const [category, setCategory] = useState(initialValues.category || '')
  const [expanded, setExpanded] = useState(false)

  const submit = (e) => {
    e?.preventDefault()
    onSearch?.({ keyword, type, category })
  }

  const clear = () => {
    setKeyword(''); setType(''); setCategory('')
    onSearch?.({ keyword:'', type:'', category:'' })
  }

  const hasFilters = keyword || type || category

  return (
    <div style={{ marginBottom: 36 }}>
      {/* Main search input */}
      <form onSubmit={submit}>
        <div style={{
          display:'flex', gap:12, alignItems:'center',
          background:'var(--bg-elevated)', border:'1px solid var(--border-subtle)',
          borderRadius:'var(--r-xl)', padding:'8px 8px 8px 20px',
          transition:'border-color 0.2s, box-shadow 0.2s',
          boxShadow: hasFilters ? '0 0 0 2px rgba(245,166,35,0.15)' : 'none',
        }}
        onFocusWithin={e => e.currentTarget.style.borderColor='var(--border-strong)'}
        >
          <Search size={18} style={{ color:'var(--text-muted)', flexShrink:0 }} />
          <input
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder="Search by item name, location, description…"
            style={{
              flex:1, background:'transparent', border:'none', outline:'none',
              color:'var(--text-primary)', fontSize:16,
            }}
          />
          {hasFilters && (
            <button type="button" onClick={clear} style={{
              width:32, height:32, borderRadius:'50%',
              background:'var(--bg-hover)', border:'none',
              display:'flex', alignItems:'center', justifyContent:'center',
              cursor:'pointer', color:'var(--text-secondary)', flexShrink:0,
              transition:'all 0.15s',
            }}>
              <X size={15}/>
            </button>
          )}
          <button
            type="button"
            onClick={() => setExpanded(e => !e)}
            style={{
              display:'flex', alignItems:'center', gap:6,
              padding:'8px 14px', borderRadius:'var(--r-full)',
              background: expanded ? 'rgba(245,166,35,0.1)' : 'var(--bg-hover)',
              border:'none', color: expanded ? 'var(--accent-gold)' : 'var(--text-secondary)',
              fontSize:13, fontFamily:'var(--font-display)', fontWeight:600,
              cursor:'pointer', transition:'all 0.2s', flexShrink:0,
            }}
          >
            <SlidersHorizontal size={15}/>
            Filters
          </button>
          <button type="submit" className="btn btn-primary btn-sm" style={{ flexShrink:0 }}>
            Search
          </button>
        </div>
      </form>

      {/* Expanded filters */}
      {expanded && (
        <div style={{
          marginTop: 16, padding:'20px 24px',
          background:'var(--bg-elevated)', borderRadius:'var(--r-lg)',
          border:'1px solid var(--border-subtle)',
          animation:'fadeUp 0.2s var(--ease-out)',
        }}>
          {/* Type filter */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)',
              letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:10 }}>Item Type</div>
            <div style={{ display:'flex', gap:8 }}>
              {[
                { value:'',      emoji:'🌐', label:'All Types' },
                { value:'LOST',  emoji:'😢', label:'Lost' },
                { value:'FOUND', emoji:'🎉', label:'Found' },
              ].map(t => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`cat-pill ${type === t.value ? 'active':''}`}
                >
                  <span className="cat-icon">{t.emoji}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category filter */}
          <div>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)',
              letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:10 }}>Category</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {CATEGORIES.map(c => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`cat-pill ${category === c.value ? 'active':''}`}
                >
                  <span className="cat-icon">{c.emoji}</span>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop:20, display:'flex', gap:10 }}>
            <button onClick={submit} className="btn btn-primary btn-sm">Apply Filters</button>
            <button onClick={clear}  className="btn btn-outline btn-sm">Clear All</button>
          </div>
        </div>
      )}
    </div>
  )
}
