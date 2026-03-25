import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Calendar, User, ArrowRight } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'

const CATEGORY_EMOJIS = {
  ELECTRONICS: '📱', CLOTHING: '👔', ACCESSORIES: '💍', BOOKS: '📚',
  KEYS: '🔑', WALLET: '👛', BAGS: '🎒', SPORTS: '⚽', DOCUMENTS: '📄',
  JEWELRY: '💎', OTHER: '📦',
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  }
}

export default function ItemCard({ item }) {
  const emoji = CATEGORY_EMOJIS[item.category] || '📦'
  const isLost = item.type === 'LOST'
  const isClaimed = item.status === 'CLAIMED'
  const isClosed = item.status === 'CLOSED'

  const MotionLink = motion(Link);

  return (
    <MotionLink
      to={`/items/${item.id}`}
      variants={itemVariants}
      whileHover={{
        y: -6,
        borderColor: 'var(--border-normal)',
        boxShadow: 'var(--shadow-md)'
      }}
      style={{
        display: 'flex', flexDirection: 'column',
        background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--r-lg)', overflow: 'hidden',
        textDecoration: 'none',
        position: 'relative',
      }}
    >
      {/* Color accent top bar */}
      <div style={{
        height: 3,
        background: isLost
          ? 'linear-gradient(90deg,#ef4444,#ff7b3a)'
          : 'linear-gradient(90deg,#22c55e,#4f8ef7)',
      }} />

      {/* Card header */}
      <div style={{ padding: '20px 20px 16px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        {/* Category emoji bubble */}
        <div style={{
          width: 52, height: 52, borderRadius: 14, flexShrink: 0,
          background: 'var(--bg-overlay)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26,
          border: '1px solid var(--border-subtle)',
        }}>
          {emoji}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span className={`badge badge-${item.type.toLowerCase()}`}>
              {isLost ? '😢 Lost' : '🎉 Found'}
            </span>
            {(isClaimed || isClosed) && (
              <span className={`badge badge-${item.status.toLowerCase()}`}>
                {isClaimed ? '✅ Claimed' : '🔒 Closed'}
              </span>
            )}
          </div>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
            color: 'var(--text-primary)', lineHeight: 1.3,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{item.title}</h3>
        </div>
      </div>

      {/* Description */}
      {item.description && (
        <p style={{
          padding: '0 20px 16px',
          color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {item.description}
        </p>
      )}

      {/* Meta */}
      <div style={{
        padding: '12px 20px', borderTop: '1px solid var(--border-subtle)',
        display: 'flex', flexDirection: 'column', gap: 6,
        marginTop: 'auto',
      }}>
        <MetaRow icon={<MapPin size={13} />} text={item.location} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <MetaRow icon={<User size={13} />} text={item.reportedByUsername || 'Anonymous'} />
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {item.createdAt
              ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
              : ''}
          </span>
        </div>
      </div>

      {/* Hover arrow */}
      <div style={{
        position: 'absolute', bottom: 16, right: 16,
        width: 28, height: 28, borderRadius: 8,
        background: 'var(--bg-hover)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: 0,
        transition: 'opacity 0.2s, background 0.2s',
      }}
        className="card-arrow text-muted"
      >
        <ArrowRight size={14} />
      </div>

      <style>{`
        a:hover .card-arrow { opacity:1!important; background:rgba(245,166,35,0.15)!important; color:var(--accent-gold)!important; }
      `}</style>
    </MotionLink>
  )
}

function MetaRow({ icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: 12 }}>
      {icon}
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{text}</span>
    </div>
  )
}
