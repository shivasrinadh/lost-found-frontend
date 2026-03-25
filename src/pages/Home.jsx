import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Search, Shield, Zap, Heart, TrendingUp } from 'lucide-react'
import { itemService } from '../services/itemService'
import ItemCard from '../components/ItemCard'
import { motion } from 'framer-motion'

const STATS = [
  { number: '2,400+', label: 'Items Reported', emoji: '📋' },
  { number: '1,800+', label: 'Items Reunited', emoji: '🎉' },
  { number: '98%', label: 'Resolution Rate', emoji: '⚡' },
  { number: '5,000+', label: 'Campus Users', emoji: '👥' },
]

const HOW_IT_WORKS = [
  { step: '01', emoji: '📝', title: 'Report It', desc: 'Fill out a quick form describing your lost or found item. Takes under 2 minutes.' },
  { step: '02', emoji: '🔔', title: 'Get Matched', desc: 'Our system matches lost reports with found items automatically.' },
  { step: '03', emoji: '🤝', title: 'Reunite', desc: 'Connect with the finder/owner and collect your item safely on campus.' },
]

const CATEGORIES = [
  { emoji: '📱', label: 'Electronics', value: 'ELECTRONICS', color: '#4f8ef7' },
  { emoji: '👔', label: 'Clothing', value: 'CLOTHING', color: '#a78bfa' },
  { emoji: '🔑', label: 'Keys', value: 'KEYS', color: '#f5a623' },
  { emoji: '👛', label: 'Wallets', value: 'WALLET', color: '#22c55e' },
  { emoji: '📚', label: 'Books', value: 'BOOKS', color: '#f87171' },
  { emoji: '🎒', label: 'Bags', value: 'BAGS', color: '#fb923c' },
  { emoji: '💍', label: 'Jewelry', value: 'JEWELRY', color: '#e879f9' },
  { emoji: '📄', label: 'Documents', value: 'DOCUMENTS', color: '#94a3b8' },
]

const FLOATING_EMOJIS = [
  { emoji: '📱', x: 8, y: 18, delay: 0, size: 40 },
  { emoji: '🎒', x: 88, y: 12, delay: 0.5, size: 36 },
  { emoji: '🔑', x: 5, y: 65, delay: 1, size: 34 },
  { emoji: '📚', x: 92, y: 58, delay: 1.5, size: 38 },
  { emoji: '👛', x: 15, y: 85, delay: 0.8, size: 30 },
  { emoji: '💍', x: 85, y: 80, delay: 1.2, size: 32 },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  }
}

export default function Home() {
  const [recentItems, setRecentItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    itemService.getAll({ size: 6, page: 0 })
      .then(d => setRecentItems(d.content || []))
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) navigate(`/items?keyword=${encodeURIComponent(search)}`)
    else navigate('/items')
  }

  const goCategory = (val) => navigate(`/items?category=${val}`)

  return (
    <motion.div className="page" style={{ padding: 0 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
        background: 'radial-gradient(ellipse 100% 70% at 50% -10%, rgba(245,166,35,0.08) 0%, transparent 60%)',
      }}>
        {/* Floating emojis */}
        {FLOATING_EMOJIS.map((f, i) => (
          <motion.div key={i} style={{
            position: 'absolute', left: `${f.x}%`, top: `${f.y}%`,
            fontSize: f.size, opacity: 0.12, pointerEvents: 'none',
            zIndex: 0, userSelect: 'none',
          }}
            animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
            transition={{ duration: 4 + i, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', delay: f.delay }}
          >
            {f.emoji}
          </motion.div>
        ))}

        {/* Grid lines background */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, opacity: 0.03,
          backgroundImage: 'linear-gradient(var(--border-normal) 1px, transparent 1px), linear-gradient(90deg, var(--border-normal) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', paddingTop: 100 }}>
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {/* Pill badge */}
            <motion.div variants={itemVariants} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.25)',
              borderRadius: 'var(--r-full)', padding: '6px 16px',
              fontSize: 13, fontWeight: 600, color: 'var(--accent-gold)',
              marginBottom: 32,
            }}>
              <motion.span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-gold)', display: 'inline-block' }}
                animate={{ boxShadow: ['0 0 0px rgba(245,166,35,0.2)', '0 0 20px rgba(245,166,35,0.8)', '0 0 0px rgba(245,166,35,0.2)'] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              Campus Lost & Found Platform
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={itemVariants} style={{
              fontSize: 'clamp(3rem,8vw,6rem)', fontWeight: 800, lineHeight: 1.05,
              letterSpacing: '-0.04em', marginBottom: 24,
            }}>
              <span style={{ color: 'var(--text-primary)' }}>Lost something?</span><br />
              <span style={{
                background: 'linear-gradient(135deg,#f5a623 0%,#ff7b3a 50%,#f5a623 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }} className="text-gradient-animate">We'll find it.</span>
            </motion.h1>

            <motion.p variants={itemVariants} style={{
              fontSize: 'clamp(1rem,2vw,1.2rem)', color: 'var(--text-secondary)',
              maxWidth: 520, margin: '0 auto 48px', lineHeight: 1.7,
            }}>
              The smartest way to report lost items and reunite students with their belongings on campus. Fast, simple, icon-first.
            </motion.p>

            {/* Hero search */}
            <motion.form variants={itemVariants} onSubmit={handleSearch} style={{
              maxWidth: 580, margin: '0 auto 48px',
            }}>
              <motion.div
                whileHover={{ y: -2, boxShadow: '0 25px 50px -12px rgba(245,166,35,0.25)' }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex', gap: 8, alignItems: 'center',
                  background: 'var(--bg-elevated)', border: '1px solid var(--border-normal)',
                  borderRadius: 'var(--r-xl)', padding: '8px 8px 8px 22px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                  transition: 'border-color 0.2s',
                }}
                onFocusCapture={e => { e.currentTarget.style.borderColor = 'var(--accent-gold)'; }}
                onBlurCapture={e => { e.currentTarget.style.borderColor = 'var(--border-normal)'; }}
              >
                <Search size={20} style={{ color: 'var(--text-muted)' }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search for lost items, locations…"
                  style={{
                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                    color: 'var(--text-primary)', fontSize: 16,
                  }}
                />
                <button type="submit" className="btn btn-primary" style={{ borderRadius: 28 }}>
                  Find It
                  <ArrowRight size={16} />
                </button>
              </motion.div>
            </motion.form>

            {/* CTA buttons */}
            <motion.div variants={itemVariants} style={{
              display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap',
              marginBottom: 80,
            }}>
              <Link to="/report/lost" className="btn btn-outline btn-lg" style={{ position: 'relative', overflow: 'hidden' }}>😢 Report Lost Item</Link>
              <Link to="/report/found" className="btn btn-outline btn-lg" style={{ position: 'relative', overflow: 'hidden' }}>🎉 Report Found Item</Link>
            </motion.div>

            {/* Stats row */}
            <motion.div variants={containerVariants} style={{
              display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16,
              maxWidth: 800, margin: '0 auto',
            }}>
              {STATS.map((s, i) => (
                <motion.div key={i} variants={itemVariants}
                  whileHover={{ y: -5, borderColor: 'var(--border-strong)', scale: 1.02 }}
                  style={{
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--r-lg)', padding: '20px 16px', textAlign: 'center',
                  }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{s.emoji}</div>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24,
                    background: 'var(--grad-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>{s.number}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 3 }}>{s.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────── */}
      <section style={{ padding: '100px 0', position: 'relative' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: 52 }}
          >
            <div style={{
              fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--accent-gold)',
              textTransform: 'uppercase', marginBottom: 12
            }}>Browse by Category</div>
            <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', marginBottom: 14 }}>
              Find what you're looking for
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 420, margin: '0 auto' }}>
              Every item has a home. Browse by category to find or report your belongings quickly.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 16 }}
          >
            {CATEGORIES.map((c, i) => (
              <motion.button
                key={c.value}
                variants={itemVariants}
                onClick={() => goCategory(c.value)}
                whileHover={{
                  y: -6,
                  scale: 1.03,
                  borderColor: c.color,
                  boxShadow: `0 12px 30px ${c.color}33`,
                  backgroundColor: `${c.color}15`
                }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--r-lg)', padding: '24px 16px',
                  cursor: 'pointer', textAlign: 'center',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                }}
              >
                <motion.span
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                  style={{ fontSize: 36, display: 'inline-block' }}
                >
                  {c.emoji}
                </motion.span>
                <span style={{
                  fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
                  color: 'var(--text-secondary)',
                }}>{c.label}</span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section style={{
        padding: '100px 0',
        background: 'linear-gradient(180deg, transparent, var(--bg-surface), transparent)',
      }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: 52 }}
          >
            <div style={{
              fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--accent-gold)',
              textTransform: 'uppercase', marginBottom: 12
            }}>How It Works</div>
            <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)' }}>
              Back in 3 simple steps
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28 }}
          >
            {HOW_IT_WORKS.map((h, i) => (
              <motion.div key={i} variants={itemVariants}
                whileHover={{ y: -8, borderColor: 'var(--border-strong)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                style={{
                  background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--r-xl)', padding: '36px 28px',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {/* Step number watermark */}
                <div style={{
                  position: 'absolute', top: -10, right: 16,
                  fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 80,
                  color: 'var(--border-subtle)', lineHeight: 1, pointerEvents: 'none',
                  userSelect: 'none',
                }}>{h.step}</div>

                <div style={{ fontSize: 48, marginBottom: 20 }}>{h.emoji}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 10 }}>
                  {h.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>{h.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── RECENT ITEMS ──────────────────────────────────── */}
      <section style={{ padding: '100px 0' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}
          >
            <div>
              <div style={{
                fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--accent-gold)',
                textTransform: 'uppercase', marginBottom: 8
              }}>Latest Activity</div>
              <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)' }}>Recently Reported</h2>
            </div>
            <Link to="/items" className="btn btn-outline" style={{ display: 'inline-flex' }}>
              View All <ArrowRight size={16} />
            </Link>
          </motion.div>

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : recentItems.length > 0 ? (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={containerVariants}
              className="grid-auto"
            >
              {recentItems.map((item, i) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} className="empty-state">
              <div className="empty-state-icon" style={{ fontSize: 36 }}>📭</div>
              <h3>No items reported yet</h3>
              <p>Be the first to report a lost or found item on campus.</p>
              <Link to="/report/lost" className="btn btn-primary">Report an Item</Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────── */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, type: "spring" }}
            style={{
              background: 'linear-gradient(135deg, rgba(245,166,35,0.12), rgba(255,123,58,0.08))',
              border: '1px solid rgba(245,166,35,0.2)',
              borderRadius: 'var(--r-xl)', padding: '60px 48px',
              textAlign: 'center',
              position: 'relative', overflow: 'hidden',
            }}>
            {/* Decorative orbs */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: 'absolute', top: -60, left: -60, width: 200, height: 200, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(245,166,35,0.15), transparent 70%)',
                pointerEvents: 'none',
              }}
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              style={{
                position: 'absolute', bottom: -60, right: -60, width: 200, height: 200, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(79,142,247,0.1), transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            <div style={{ fontSize: 52, marginBottom: 20 }}>🎯</div>
            <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', marginBottom: 16 }}>
              Lost something today?
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto 36px', fontSize: 16 }}>
              Don't panic. Report it now and let the campus community help you find it.
              Most items are returned within 24 hours.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/report/lost" className="btn btn-primary btn-lg">😢 I Lost Something</Link>
              <Link to="/report/found" className="btn btn-outline btn-lg">🎉 I Found Something</Link>
            </div>
          </motion.div>
        </div>
      </section>

      <style>{`
        @media(max-width:768px){
          section > .container > div[style*="repeat(4,1fr)"] {grid-template-columns:repeat(2,1fr)!important}
          section > .container > div[style*="repeat(3,1fr)"] {grid-template-columns:1fr!important}
        }
      `}</style>
    </motion.div>
  )
}
