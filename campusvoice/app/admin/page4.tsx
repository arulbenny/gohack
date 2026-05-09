'use client'


import { useState } from 'react'
import Link from 'next/link'
import {
  MessageSquare, BarChart3, CheckCircle, Clock, AlertCircle,
  TrendingUp, Users, Zap, LogOut, ChevronDown, Filter, RefreshCw
} from 'lucide-react'


const CAT_COLORS: Record<string, string> = {
  'Mess & Food': '#f9ca24',
  'Wi-Fi & Tech': '#6c63ff',
  'Infrastructure': '#ff6584',
  'Safety': '#ff4757',
  'Academics': '#43e97b',
  'Mental Health': '#a29bfe',
  'Other': '#778ca3',
}


const MOCK_ISSUES = [
  { id: 1, category: 'Wi-Fi & Tech', status: 'Pending', title: 'Hostel Wi-Fi disconnects every night after 11pm', upvotes: 312, time: '5h ago', aiTag: 'Urgent' },
  { id: 2, category: 'Mess & Food', status: 'In Progress', title: 'Mess food quality has drastically dropped this semester', upvotes: 247, time: '2d ago', aiTag: 'Recurring' },
  { id: 3, category: 'Safety', status: 'Pending', title: 'Street lights near Block C are broken for 2 weeks', upvotes: 189, time: '1d ago', aiTag: 'Long Pending' },
  { id: 4, category: 'Infrastructure', status: 'In Progress', title: 'Elevator in main block has been out of service for a month', upvotes: 134, time: '5d ago', aiTag: 'High Priority' },
  { id: 5, category: 'Academics', status: 'Pending', title: "Exam schedule clashes with another department's internal exam", upvotes: 98, time: '3d ago', aiTag: 'Important' },
  { id: 6, category: 'Mental Health', status: 'Resolved', title: 'Need a dedicated counsellor available on weekends', upvotes: 156, time: '2d ago', aiTag: 'Resolved' },
]


const STATS = [
  { label: 'Total Issues', value: '124', icon: MessageSquare, color: '#6c63ff', change: '+12 this week' },
  { label: 'Pending', value: '48', icon: AlertCircle, color: '#f9ca24', change: '38% of total' },
  { label: 'In Progress', value: '31', icon: Clock, color: '#6c63ff', change: '25% of total' },
  { label: 'Resolved', value: '45', icon: CheckCircle, color: '#43e97b', change: '+8 this week' },
]


const AI_SUMMARY = [
  { category: 'Wi-Fi & Tech', count: 28, trend: 'up', insight: 'Spike in complaints this week — likely infrastructure issue.' },
  { category: 'Mess & Food', count: 22, trend: 'up', insight: 'Quality complaints have doubled since last month.' },
  { category: 'Safety', count: 18, trend: 'stable', insight: 'Lighting and patrol concerns are recurring themes.' },
  { category: 'Mental Health', count: 14, trend: 'down', insight: 'Down after weekend counsellor was added.' },
]


const STATUS_OPTIONS = ['Pending', 'In Progress', 'Resolved']


function StatusBadge({ status }: { status: string }) {
  const cls = status === 'Resolved' ? 'badge-resolved' : status === 'In Progress' ? 'badge-progress' : 'badge-pending'
  return <span className={`category-pill ${cls}`}>{status}</span>
}


function AiTagBadge({ tag }: { tag: string }) {
  const color = tag === 'Urgent' || tag === 'High Priority' ? '#ff4757' :
    tag === 'Recurring' ? '#f9ca24' :
    tag === 'Long Pending' ? '#ff6584' :
    '#43e97b'
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
      background: `${color}15`, color, border: `1px solid ${color}40`,
      textTransform: 'uppercase', letterSpacing: 0.5,
    }}>
      🤖 {tag}
    </span>
  )
}


export default function AdminDashboard() {
  const [issues, setIssues] = useState(MOCK_ISSUES)
  const [activeTab, setActiveTab] = useState<'issues' | 'insights'>('issues')
  const [filterStatus, setFilterStatus] = useState('All')
  const [aiLoading, setAiLoading] = useState(false)
  const [showAiPanel, setShowAiPanel] = useState(false)


  const updateStatus = (id: number, newStatus: string) => {
    setIssues(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i))
  }


  const runAiScan = async () => {
    setAiLoading(true)
    await new Promise(r => setTimeout(r, 2000))
    setAiLoading(false)
    setShowAiPanel(true)
  }


  const filtered = issues.filter(i => filterStatus === 'All' || i.status === filterStatus)


  const categoryData = Object.entries(
    issues.reduce((acc, i) => {
      acc[i.category] = (acc[i.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1])


  const maxCount = Math.max(...categoryData.map(([, v]) => v))


  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>


      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10, 10, 15, 0.95)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 32px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #6c63ff, #ff6584)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <MessageSquare size={16} color="white" />
          </div>
          <span style={{ fontFamily: 'Clash Display', fontWeight: 700, fontSize: 20 }}>
            Campus<span style={{ color: 'var(--primary)' }}>Voice</span>
          </span>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
            background: 'rgba(255,101,132,0.15)', color: '#ff6584', border: '1px solid rgba(255,101,132,0.3)',
            textTransform: 'uppercase', letterSpacing: 1,
          }}>Admin</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>VIT Vellore</span>
        </div>


        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={runAiScan}
            className="btn-primary"
            style={{
              padding: '8px 16px', fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
            }}
            disabled={aiLoading}
          >
            {aiLoading ? (
              <div style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.3)', borderTop: '2px solid black', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            ) : (
              <Zap size={14} color="black" />
            )}
            <span style={{ color: 'black', fontWeight: 700 }}>
              {aiLoading ? 'Scanning...' : 'AI Insights'}
            </span>
          </button>
          <Link href="/login">
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <LogOut size={18} />
            </button>
          </Link>
        </div>
      </nav>


      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>


        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Clash Display', fontSize: 30, fontWeight: 700, marginBottom: 4 }}>
            Admin Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Monitor, prioritise, and resolve campus issues in real time.
          </p>
        </div>


        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 32 }}>
          {STATS.map((s, i) => (
            <div key={i} className="glass" style={{ padding: '20px 22px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                background: `${s.color}18`, border: `1px solid ${s.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <s.icon size={19} color={s.color} />
              </div>
              <div>
                <div style={{ fontSize: 26, fontFamily: 'Clash Display', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: s.color, marginTop: 4, fontWeight: 600 }}>{s.change}</div>
              </div>
            </div>
          ))}
        </div>


        {/* Category Bar Chart */}
        <div className="glass" style={{ padding: '24px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'Clash Display', fontSize: 17, fontWeight: 700 }}>
              Issues by Category
            </h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Last 30 days</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {categoryData.map(([cat, count]) => (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 120, fontSize: 13, color: 'var(--text-secondary)', textAlign: 'right', flexShrink: 0 }}>{cat}</div>
                <div style={{ flex: 1, height: 10, background: 'var(--surface-2)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 999,
                    width: `${(count / maxCount) * 100}%`,
                    background: `linear-gradient(90deg, ${CAT_COLORS[cat]}, ${CAT_COLORS[cat]}aa)`,
                    transition: 'width 1s ease',
                  }} />
                </div>
                <div style={{ width: 24, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', flexShrink: 0 }}>{count}</div>
              </div>
            ))}
          </div>
        </div>


        {/* AI Summary Panel */}
        {showAiPanel && (
          <div style={{
            marginBottom: 24, padding: '24px',
            background: 'linear-gradient(135deg, rgba(67,233,123,0.08), rgba(56,249,215,0.05))',
            border: '1px solid rgba(67,233,123,0.25)', borderRadius: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Zap size={18} color="#43e97b" />
              <h3 style={{ fontFamily: 'Clash Display', fontSize: 17, fontWeight: 700, color: '#43e97b' }}>
                AI Campus Insights
              </h3>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>Generated just now · Powered by Gemini</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              {AI_SUMMARY.map((s, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '14px 16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: CAT_COLORS[s.category] }}>
                      {s.category}
                    </span>
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 999,
                      background: s.trend === 'up' ? 'rgba(255,71,87,0.15)' : s.trend === 'down' ? 'rgba(67,233,123,0.15)' : 'rgba(108,99,255,0.15)',
                      color: s.trend === 'up' ? '#ff4757' : s.trend === 'down' ? '#43e97b' : 'var(--primary)',
                    }}>
                      {s.trend === 'up' ? '↑ Rising' : s.trend === 'down' ? '↓ Dropping' : '→ Stable'}
                    </span>
                  </div>
                  <div style={{ fontSize: 22, fontFamily: 'Clash Display', fontWeight: 700, marginBottom: 4 }}>{s.count}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{s.insight}</div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Issues Table */}
        <div className="glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <h3 style={{ fontFamily: 'Clash Display', fontSize: 17, fontWeight: 700 }}>
              All Issues
            </h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Filter size={14} color="var(--text-muted)" />
              <div style={{ display: 'flex', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                {['All', ...STATUS_OPTIONS].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)} style={{
                    padding: '6px 14px', border: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'Satoshi', fontWeight: 600,
                    background: filterStatus === s ? 'var(--primary)' : 'transparent',
                    color: filterStatus === s ? 'white' : 'var(--text-muted)',
                    transition: 'all 0.2s',
                  }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>


          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(issue => (
              <div key={issue.id} style={{
                padding: '16px', borderRadius: 12, border: '1px solid var(--border)',
                background: 'var(--surface-2)', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
                transition: 'all 0.2s',
              }}>
                {/* Upvotes */}
                <div style={{
                  width: 48, height: 48, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <TrendingUp size={13} color="var(--primary)" />
                  <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)' }}>{issue.upvotes}</span>
                </div>


                {/* Info */}
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                      background: `${CAT_COLORS[issue.category]}15`, color: CAT_COLORS[issue.category],
                      textTransform: 'uppercase', letterSpacing: 0.5,
                    }}>
                      {issue.category}
                    </span>
                    <AiTagBadge tag={issue.aiTag} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{issue.time}</span>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {issue.title}
                  </p>
                </div>


                {/* Status Dropdown */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <select
                    value={issue.status}
                    onChange={e => updateStatus(issue.id, e.target.value)}
                    style={{
                      appearance: 'none', cursor: 'pointer',
                      padding: '8px 32px 8px 12px',
                      borderRadius: 10, fontSize: 12, fontFamily: 'Satoshi', fontWeight: 600,
                      border: `1px solid ${issue.status === 'Resolved' ? 'rgba(67,233,123,0.4)' : issue.status === 'In Progress' ? 'rgba(108,99,255,0.4)' : 'rgba(249,202,36,0.4)'}`,
                      background: issue.status === 'Resolved' ? 'rgba(67,233,123,0.1)' : issue.status === 'In Progress' ? 'rgba(108,99,255,0.1)' : 'rgba(249,202,36,0.1)',
                      color: issue.status === 'Resolved' ? 'var(--accent-green)' : issue.status === 'In Progress' ? 'var(--primary)' : 'var(--accent-yellow)',
                      outline: 'none',
                    }}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s} style={{ background: 'var(--surface)', color: 'var(--text-primary)' }}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={12} style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: issue.status === 'Resolved' ? 'var(--accent-green)' : issue.status === 'In Progress' ? 'var(--primary)' : 'var(--accent-yellow)',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

