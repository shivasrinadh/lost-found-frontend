import React, { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Grid, List as ListIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { itemService } from '../services/itemService'
import ItemCard from '../components/ItemCard'
import SearchBar from '../components/SearchBar'
import { useAuth } from '../context/AuthContext'

const SORT_OPTIONS = [
  { value:'createdAt,desc', label:'🕐 Newest First' },
  { value:'createdAt,asc',  label:'🕐 Oldest First' },
  { value:'title,asc',      label:'🔤 A → Z' },
]

export default function ItemList() {
  const { isAuth } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [items,   setItems]   = useState([])
  const [total,   setTotal]   = useState(0)
  const [pages,   setPages]   = useState(0)
  const [loading, setLoading] = useState(true)
  const [view,    setView]    = useState('grid')
  const [sort,    setSort]    = useState('createdAt,desc')

  const page     = parseInt(searchParams.get('page') || '0')
  const keyword  = searchParams.get('keyword')  || ''
  const type     = searchParams.get('type')     || ''
  const category = searchParams.get('category') || ''

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const [sortField, sortDir] = sort.split(',')
      const res = await itemService.getAll({
        page, size: 12, keyword: keyword || undefined,
        type: type || undefined, category: category || undefined,
        sort: `${sortField},${sortDir}`,
      })
      setItems(res.content || [])
      setTotal(res.totalElements || 0)
      setPages(res.totalPages || 0)
    } catch { setItems([]) }
    finally  { setLoading(false) }
  }, [page, keyword, type, category, sort])

  useEffect(() => { fetchItems() }, [fetchItems])

  const handleSearch = ({ keyword, type, category }) => {
    const p = new URLSearchParams()
    if (keyword)  p.set('keyword',  keyword)
    if (type)     p.set('type',     type)
    if (category) p.set('category', category)
    setSearchParams(p)
  }

  const goPage = (n) => {
    const p = new URLSearchParams(searchParams)
    p.set('page', n)
    setSearchParams(p)
    window.scrollTo({ top: 0, behavior:'smooth' })
  }

  const activeFilters = [
    type     && { label: type === 'LOST' ? '😢 Lost':'🎉 Found', key:'type' },
    category && { label: category, key:'category' },
    keyword  && { label: `"${keyword}"`, key:'keyword' },
  ].filter(Boolean)

  const clearFilter = (key) => {
    const p = new URLSearchParams(searchParams)
    p.delete(key); p.delete('page')
    setSearchParams(p)
  }

  return (
    <div className="page">
      <div className="container">

        {/* Header */}
        <div style={{ marginBottom:40 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
            <div>
              <h1 style={{ fontSize:'clamp(1.8rem,4vw,2.8rem)', marginBottom:6 }}>Browse Items</h1>
              <p style={{ color:'var(--text-secondary)' }}>
                {loading ? 'Loading…' : `${total.toLocaleString()} item${total !== 1 ? 's':''} reported`}
              </p>
            </div>
            {isAuth && (
              <div style={{ display:'flex', gap:10 }}>
                <Link to="/report/lost"  className="btn btn-outline btn-sm">😢 Lost</Link>
                <Link to="/report/found" className="btn btn-primary btn-sm"><Plus size={15}/> Found</Link>
              </div>
            )}
          </div>

          {/* Active filters chips */}
          {activeFilters.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:16 }}>
              {activeFilters.map(f => (
                <button
                  key={f.key}
                  onClick={() => clearFilter(f.key)}
                  style={{
                    display:'inline-flex', alignItems:'center', gap:6,
                    padding:'5px 12px', borderRadius:'var(--r-full)',
                    background:'rgba(245,166,35,0.12)', border:'1px solid rgba(245,166,35,0.25)',
                    color:'var(--accent-gold)', fontSize:13, cursor:'pointer',
                    fontFamily:'var(--font-display)', fontWeight:600,
                    transition:'all 0.15s',
                  }}
                >
                  {f.label} ✕
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search bar */}
        <SearchBar
          onSearch={handleSearch}
          initialValues={{ keyword, type, category }}
        />

        {/* Toolbar */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <div style={{ color:'var(--text-muted)', fontSize:13 }}>
            {!loading && items.length > 0 && `Showing ${page*12+1}–${Math.min((page+1)*12, total)} of ${total}`}
          </div>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            {/* Sort */}
            <div style={{ position:'relative' }}>
              <select
                value={sort} onChange={e => setSort(e.target.value)}
                className="select-field"
                style={{ paddingRight:32, fontSize:13, padding:'8px 14px', minWidth:160 }}
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            {/* View toggle */}
            <div style={{ display:'flex', gap:4, background:'var(--bg-elevated)', border:'1px solid var(--border-subtle)', borderRadius:'var(--r-md)', padding:4 }}>
              {[
                { v:'grid', Icon: Grid },
                { v:'list', Icon: ListIcon },
              ].map(({ v, Icon }) => (
                <button key={v} onClick={() => setView(v)} style={{
                  width:32, height:32, borderRadius:'var(--r-sm)', border:'none', cursor:'pointer',
                  background: view === v ? 'var(--bg-overlay)':'transparent',
                  color: view === v ? 'var(--accent-gold)':'var(--text-muted)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  transition:'all 0.15s',
                }}><Icon size={15}/></button>
              ))}
            </div>
          </div>
        </div>

        {/* Items grid / list */}
        {loading ? (
          <div className="loading-center"><div className="spinner"/></div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ fontSize:40 }}>🔍</div>
            <h3>No items found</h3>
            <p>Try adjusting your search filters or report a new item.</p>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setSearchParams({})} className="btn btn-outline">Clear Filters</button>
              {isAuth && <Link to="/report/lost" className="btn btn-primary">Report Item</Link>}
            </div>
          </div>
        ) : view === 'grid' ? (
          <div className="grid-auto">
            {items.map((item, i) => <ItemCard key={item.id} item={item} delay={i * 40} />)}
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {items.map((item, i) => <ListRow key={item.id} item={item} delay={i*30}/>)}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:8, marginTop:48 }}>
            <button
              onClick={() => goPage(page - 1)} disabled={page === 0}
              className="btn btn-outline btn-sm" style={{ gap:4 }}
            >
              <ChevronLeft size={16}/> Prev
            </button>
            <div style={{ display:'flex', gap:4 }}>
              {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                const pg = pages <= 7 ? i : (page < 4 ? i : page - 3 + i)
                if (pg >= pages) return null
                return (
                  <button key={pg} onClick={() => goPage(pg)} style={{
                    width:36, height:36, borderRadius:'var(--r-sm)', border:'none',
                    background: pg === page ? 'var(--grad-gold)':'var(--bg-elevated)',
                    color: pg === page ? '#0a0a0f':'var(--text-secondary)',
                    fontFamily:'var(--font-display)', fontWeight:600, fontSize:14,
                    cursor:'pointer', transition:'all 0.15s',
                    border: pg !== page ? '1px solid var(--border-subtle)':'none',
                  }}>{pg + 1}</button>
                )
              })}
            </div>
            <button
              onClick={() => goPage(page + 1)} disabled={page >= pages - 1}
              className="btn btn-outline btn-sm" style={{ gap:4 }}
            >
              Next <ChevronRight size={16}/>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ListRow({ item, delay }) {
  const EMOJIS = { ELECTRONICS:'📱',CLOTHING:'👔',ACCESSORIES:'💍',BOOKS:'📚',KEYS:'🔑',WALLET:'👛',BAGS:'🎒',SPORTS:'⚽',DOCUMENTS:'📄',JEWELRY:'💎',OTHER:'📦' }
  return (
    <Link to={`/items/${item.id}`} style={{
      display:'flex', alignItems:'center', gap:16,
      background:'var(--bg-elevated)', border:'1px solid var(--border-subtle)',
      borderRadius:'var(--r-lg)', padding:'16px 20px',
      textDecoration:'none', transition:'all 0.2s',
      animation:`fadeUp 0.4s ${delay}ms var(--ease-out) both`,
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-normal)'; e.currentTarget.style.transform='translateX(4px)' }}
    onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border-subtle)'; e.currentTarget.style.transform='translateX(0)' }}
    >
      <div style={{
        width:44, height:44, borderRadius:12, background:'var(--bg-overlay)',
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0,
        border:'1px solid var(--border-subtle)',
      }}>{EMOJIS[item.category] || '📦'}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
          <span className={`badge badge-${item.type.toLowerCase()}`} style={{ fontSize:10 }}>
            {item.type === 'LOST' ? '😢 Lost':'🎉 Found'}
          </span>
          {item.status !== 'OPEN' && (
            <span className={`badge badge-${item.status.toLowerCase()}`} style={{ fontSize:10 }}>
              {item.status}
            </span>
          )}
        </div>
        <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15, color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.title}</h3>
      </div>
      <div style={{ color:'var(--text-muted)', fontSize:12, textAlign:'right', flexShrink:0 }}>
        <div>📍 {item.location}</div>
        <div style={{ marginTop:2 }}>👤 {item.reportedByUsername}</div>
      </div>
    </Link>
  )
}
