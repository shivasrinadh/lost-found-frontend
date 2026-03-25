import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
    ResponsiveContainer,
    RadialBarChart,
    RadialBar,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    Radar,
    FunnelChart,
    Funnel,
    LabelList,
    BarChart,
    Bar,
} from 'recharts'
import { itemService } from '../services/itemService'

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const CHART_COLORS = {
    gold: '#f9b33a',
    warm: '#fc8047',
    cool: '#4fa0f7',
    success: '#2dd86d',
    danger: '#f45252',
    text: '#f5f4ef',
    muted: '#a3a29b',
}

function safeDate(value) {
    const d = value ? new Date(value) : null
    return d && !Number.isNaN(d.getTime()) ? d : null
}

function getCategory(item) {
    return item?.category || item?.itemCategory || 'Other'
}

function getPriority(item) {
    const value = item?.priority
    if (value === 'HIGH' || value === 2) return 2
    if (value === 'MEDIUM' || value === 1) return 1
    return 0
}

function buildInsights(items, claims) {
    const total = items.length
    const lost = items.filter((i) => i.type === 'LOST').length
    const found = items.filter((i) => i.type === 'FOUND').length
    const recovered = items.filter((i) => i.status === 'CLAIMED' || i.status === 'CLOSED').length
    const open = items.filter((i) => i.status === 'OPEN').length

    const pendingClaims = claims.filter((c) => c.status === 'PENDING').length
    const approvedClaims = claims.filter((c) => c.status === 'APPROVED').length
    const rejectedClaims = claims.filter((c) => c.status === 'REJECTED').length

    const recoveryRate = total ? Math.round((recovered / total) * 100) : 0
    const claimApprovalRate = claims.length ? Math.round((approvedClaims / claims.length) * 100) : 0

    const now = new Date()
    const monthly = Array.from({ length: 6 }).map((_, idx) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1)
        return {
            key: `${d.getFullYear()}-${d.getMonth()}`,
            label: MONTH_LABELS[d.getMonth()],
            lost: 0,
            found: 0,
            recovered: 0,
        }
    })

    const monthMap = new Map(monthly.map((m) => [m.key, m]))

    items.forEach((item) => {
        const d = safeDate(item.createdAt || item.reportedAt)
        if (!d) return
        const key = `${d.getFullYear()}-${d.getMonth()}`
        const target = monthMap.get(key)
        if (!target) return

        if (item.type === 'LOST') target.lost += 1
        if (item.type === 'FOUND') target.found += 1
        if (item.status === 'CLAIMED' || item.status === 'CLOSED') target.recovered += 1
    })

    const categoryMap = {}
    items.forEach((item) => {
        const category = getCategory(item)
        categoryMap[category] = (categoryMap[category] || 0) + 1
    })

    const topCategories = Object.entries(categoryMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([category, count]) => ({ category, count }))

    const itemIdsWithClaims = new Set(claims.map((c) => c.itemId).filter(Boolean))
    let matched = itemIdsWithClaims.size
    let verified = approvedClaims
    let completed = recovered

    matched = Math.min(matched, total)
    verified = Math.min(verified, matched)
    completed = Math.min(completed, verified)

    const journey = [
        { name: 'Reported', value: total, fill: '#4fa0f7' },
        { name: 'Matched', value: matched, fill: '#f9b33a' },
        { name: 'Verified', value: verified, fill: '#fc8047' },
        { name: 'Recovered', value: completed, fill: '#2dd86d' },
    ]

    const hourlyByPriority = Array.from({ length: 6 }).map((_, idx) => ({
        slot: `${idx * 4}:00-${idx * 4 + 3}:59`,
        low: 0,
        medium: 0,
        high: 0,
    }))

    items.forEach((item) => {
        const d = safeDate(item.createdAt || item.reportedAt)
        if (!d) return
        const slot = Math.floor(d.getHours() / 4)
        const priority = getPriority(item)
        const target = hourlyByPriority[slot]
        if (!target) return
        if (priority === 2) target.high += 1
        else if (priority === 1) target.medium += 1
        else target.low += 1
    })

    const compass = [
        { name: 'Recovered', value: recoveryRate, fill: '#2dd86d' },
        { name: 'Open', value: total ? Math.round((open / total) * 100) : 0, fill: '#4fa0f7' },
        { name: 'Pending Claims', value: claims.length ? Math.round((pendingClaims / claims.length) * 100) : 0, fill: '#f9b33a' },
    ]

    const plainStory = {
        headline: recoveryRate >= 65 ? 'Great recovery momentum this period.' : 'Recovery can be improved with faster claim verification.',
        explanation:
            recoveryRate >= 65
                ? 'Most reports are closing successfully. Keep prioritizing pending claims to sustain momentum.'
                : 'You have many open reports. Focusing on high-confidence matches and quick approval cycles can boost recovery.',
    }

    return {
        metrics: {
            total,
            lost,
            found,
            recovered,
            open,
            pendingClaims,
            approvedClaims,
            rejectedClaims,
            recoveryRate,
            claimApprovalRate,
        },
        monthly,
        topCategories,
        journey,
        hourlyByPriority,
        compass,
        plainStory,
    }
}

function InsightCard({ title, value, sub, color, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay }}
            className="analytics-card"
            style={{ borderColor: color ? `${color}50` : 'var(--border-subtle)' }}
        >
            <p className="analytics-card-title">{title}</p>
            <h3 style={{ color: color || 'var(--text-primary)' }}>{value}</h3>
            <p className="analytics-card-sub">{sub}</p>
        </motion.div>
    )
}

function Explain({ text }) {
    return <p className="analytics-explain">{text}</p>
}

export default function Analytics() {
    const [items, setItems] = useState([])
    const [claims, setClaims] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let mounted = true

        async function load() {
            setLoading(true)
            setError('')
            try {
                const [itemsRes, claimsRes] = await Promise.all([
                    itemService.getAll({ page: 0, size: 500 }),
                    itemService.getAllClaims({ page: 0, size: 500 }),
                ])

                if (!mounted) return
                setItems(itemsRes?.content || [])
                setClaims(claimsRes?.content || [])
            } catch (e) {
                if (!mounted) return
                setError('Unable to load analytics right now. Please refresh in a moment.')
            } finally {
                if (mounted) setLoading(false)
            }
        }

        load()
        return () => {
            mounted = false
        }
    }, [])

    const insights = useMemo(() => buildInsights(items, claims), [items, claims])

    if (loading) {
        return (
            <div className="page">
                <div className="container">
                    <div className="loading-center"><div className="spinner" /></div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="page">
                <div className="container">
                    <div className="empty-state">
                        <div className="empty-state-icon">📊</div>
                        <h3>Analytics Not Available</h3>
                        <p>{error}</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="page analytics-page">
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="analytics-hero"
                >
                    <p className="analytics-kicker">Visual Intelligence Center</p>
                    <h1>Recovery Analytics That Anyone Can Understand</h1>
                    <p>
                        Every chart below explains itself in plain language, so your team can act fast without needing analytics training.
                    </p>
                </motion.div>

                <div className="analytics-metrics-grid">
                    <InsightCard title="Total Reports" value={insights.metrics.total} sub="All lost and found submissions" color={CHART_COLORS.cool} delay={0} />
                    <InsightCard title="Recovery Rate" value={`${insights.metrics.recoveryRate}%`} sub="Items recovered out of all reports" color={CHART_COLORS.success} delay={0.04} />
                    <InsightCard title="Claim Approval" value={`${insights.metrics.claimApprovalRate}%`} sub="Approved claims across all claims" color={CHART_COLORS.gold} delay={0.08} />
                    <InsightCard title="Open Cases" value={insights.metrics.open} sub="Items still waiting for closure" color={CHART_COLORS.warm} delay={0.12} />
                </div>

                <div className="analytics-grid">
                    <section className="analytics-panel analytics-panel-tall">
                        <div className="analytics-panel-head">
                            <h3>Recovery Compass</h3>
                            <span>At a glance health meter</span>
                        </div>
                        <div style={{ width: '100%', height: 320 }}>
                            <ResponsiveContainer>
                                <RadialBarChart innerRadius="25%" outerRadius="95%" barSize={20} data={insights.compass}>
                                    <RadialBar dataKey="value" background cornerRadius={8} label={{ fill: CHART_COLORS.text, position: 'insideStart' }} />
                                    <Tooltip formatter={(value) => `${value}%`} />
                                </RadialBarChart>
                            </ResponsiveContainer>
                        </div>
                        <Explain text="This circle shows how healthy your system is: green means recovered, blue means still open, gold means claim approvals still pending." />
                    </section>

                    <section className="analytics-panel analytics-panel-tall">
                        <div className="analytics-panel-head">
                            <h3>Item Journey Funnel</h3>
                            <span>From report to final recovery</span>
                        </div>
                        <div style={{ width: '100%', height: 320 }}>
                            <ResponsiveContainer>
                                <FunnelChart>
                                    <Tooltip />
                                    <Funnel dataKey="value" data={insights.journey} isAnimationActive>
                                        <LabelList position="right" fill={CHART_COLORS.text} stroke="none" dataKey="name" />
                                    </Funnel>
                                </FunnelChart>
                            </ResponsiveContainer>
                        </div>
                        <Explain text="Each stage narrows so everyone can instantly see where most cases drop off and where action is needed." />
                    </section>

                    <section className="analytics-panel">
                        <div className="analytics-panel-head">
                            <h3>Lost vs Found Rhythm</h3>
                            <span>Last 6 months trend</span>
                        </div>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <AreaChart data={insights.monthly}>
                                    <defs>
                                        <linearGradient id="lostFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={CHART_COLORS.danger} stopOpacity={0.6} />
                                            <stop offset="95%" stopColor={CHART_COLORS.danger} stopOpacity={0.05} />
                                        </linearGradient>
                                        <linearGradient id="foundFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.6} />
                                            <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0.05} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.08)" />
                                    <XAxis dataKey="label" stroke={CHART_COLORS.muted} />
                                    <YAxis stroke={CHART_COLORS.muted} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="lost" stroke={CHART_COLORS.danger} fill="url(#lostFill)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="found" stroke={CHART_COLORS.success} fill="url(#foundFill)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="recovered" stroke={CHART_COLORS.gold} fillOpacity={0} strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <Explain text="Red is what people lost, green is what people found, and gold is what finally got recovered. When gold rises, your process is working better." />
                    </section>

                    <section className="analytics-panel">
                        <div className="analytics-panel-head">
                            <h3>Category Fingerprint Radar</h3>
                            <span>Where most reports happen</span>
                        </div>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <RadarChart data={insights.topCategories}>
                                    <PolarGrid stroke="rgba(255,255,255,0.16)" />
                                    <PolarAngleAxis dataKey="category" tick={{ fill: CHART_COLORS.text, fontSize: 11 }} />
                                    <Radar name="Reports" dataKey="count" stroke={CHART_COLORS.cool} fill={CHART_COLORS.cool} fillOpacity={0.45} />
                                    <Tooltip />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <Explain text="Bigger spikes show categories where people struggle most. Focus awareness and prevention campaigns in these areas first." />
                    </section>

                    <section className="analytics-panel analytics-panel-wide">
                        <div className="analytics-panel-head">
                            <h3>Easy Time Heat Bars</h3>
                            <span>When reports are submitted in the day</span>
                        </div>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={insights.hourlyByPriority}>
                                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.08)" />
                                    <XAxis dataKey="slot" stroke={CHART_COLORS.muted} />
                                    <YAxis stroke={CHART_COLORS.muted} />
                                    <Tooltip />
                                    <Bar dataKey="low" stackId="a" fill="#5f6b7a" radius={[0, 0, 4, 4]} />
                                    <Bar dataKey="medium" stackId="a" fill={CHART_COLORS.gold} />
                                    <Bar dataKey="high" stackId="a" fill={CHART_COLORS.warm} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <Explain text="Taller bars mean busier time blocks. Dark color means low urgency, yellow means medium, orange means high urgency cases." />
                    </section>
                </div>

                <section className="analytics-story-strip">
                    <h3>Simple AI-Style Summary</h3>
                    <p className="analytics-story-headline">{insights.plainStory.headline}</p>
                    <p>{insights.plainStory.explanation}</p>
                </section>
            </div>
        </div>
    )
}
