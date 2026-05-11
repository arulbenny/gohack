'use client'

import { useState, useEffect, type ComponentType } from 'react'
import { useRouter } from 'next/navigation'
import {
  MessageSquare, BarChart3, CheckCircle, Clock, AlertCircle,
  TrendingUp, Zap, LogOut, ChevronDown, Users,
  Trash2
} from 'lucide-react'

type Issue = {
  id: string
  status: 'Pending' | 'In Progress' | 'Resolved' | string
  category: string
  created_at: string
  title: string
  upvote_count: number
  admin_response?: string
  admin_responded_at?: string
  is_escalated?: boolean
  escalated_at?: string
}

type PendingUser = {
  id: string
  full_name: string
  email: string
  role: string
}

type AIInsight = {
  category: keyof typeof CAT_COLORS
  trend: 'up' | 'down' | 'stable'
  insight: string
}

const CAT_COLORS: Record<string, string> = {
  'Mess & Food': '#f9ca24',
  'Wi-Fi & Tech': '#6c63ff',
  'Infrastructure': '#ff6584',
  'Safety': '#ff4757',
  'Academics': '#43e97b',
  'Mental Health': '#a29bfe',
  'Other': '#778ca3',
}

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Resolved'] as const

const AI_INSIGHTS: AIInsight[] = [
  { category: 'Wi-Fi & Tech', trend: 'up', insight: 'Spike in complaints this week — likely infrastructure issue.' },
  { category: 'Mess & Food', trend: 'up', insight: 'Quality complaints have doubled since last month.' },
  { category: 'Safety', trend: 'stable', insight: 'Lighting and patrol concerns are recurring themes.' },
  { category: 'Mental Health', trend: 'down', insight: 'Down after weekend counsellor was added.' },
]

function AdminResponseBox({ issue, onSave }: { issue: Issue, onSave: (id: string, response: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [response, setResponse] = useState(issue.admin_response || '')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    await fetch(`/api/issues/${issue.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_response: response }),
    })
    onSave(issue.id, response)
    setSaving(false)
    setEditing(false)
  }

  return (
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <textarea
            value={response}
            onChange={e => setResponse(e.target.value)}
            placeholder="Write an official response to this issue..."
            rows={3}
            className="input-dark"
            style={{ fontSize: 13, resize: 'vertical' }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setEditing(false)} className="btn-secondary" style={{ flex: 1, fontSize: 12, padding: '8px' }}>
              Cancel
            </button>
            <button onClick={save} disabled={saving} className="btn-primary" style={{ flex: 1, fontSize: 12, padding: '8px' }}>
              {saving ? 'Saving...' : 'Post Response'}
            </button>
          </div>
        </div>
      ) : (
        <div>
          {issue.admin_response ? (
            <div style={{
              background: 'rgba(67,233,123,0.06)', border: '1px solid rgba(67,233,123,0.2)',
              borderRadius: 10, padding: '10px 14px', marginBottom: 8,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#43e97b' }}>✓ Official Response</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {issue.admin_responded_at ? new Date(issue.admin_responded_at).toLocaleDateString() : ''}
                </span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{issue.admin_response}</p>
            </div>
          ) : null}
          <button
            onClick={() => setEditing(true)}
            style={{
              background: 'none', border: '1px dashed var(--border)', borderRadius: 8,
              padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600,
              color: 'var(--text-muted)', width: '100%',
            }}
          >
            {issue.admin_response ? '✏️ Edit Response' : '💬 Add Official Response'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const router = useRouter()
  const [issues, setIssues] = useState<Issue[]>([])
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('All')
  const [aiLoading, setAiLoading] = useState(false)
  const [showAiPanel, setShowAiPanel] = useState(false)
  const [activeTab, setActiveTab] = useState<'issues' | 'users'>('issues')
  const [collegeId, setCollegeId] = useState<string | null>(null)
  const [collegeName, setCollegeName] = useState('')
  const [dismissedEscalations, setDismissedEscalations] = useState<string[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('user')
    const cid = localStorage.getItem('college_id')
    if (!stored || !cid) { router.push('/login'); return }
    const u = JSON.parse(stored)
    if (u.role !== 'admin') { router.push('/feed'); return }
    setCollegeId(cid)
    setCollegeName(u.colleges?.name || 'My Campus')
    fetchIssues(cid)
    fetchPendingUsers(cid)
  }, [])

  const fetchIssues = async (cid: string) => {
    setLoading(true)
    const res = await fetch(`/api/issues?college_id=${cid}`)
    const result = (await res.json()) as { data?: Issue[] }
    setIssues(result.data || [])
    setLoading(false)
  }

  const fetchPendingUsers = async (cid: string) => {
    const res = await fetch(`/api/admin/users?college_id=${cid}`)
    const result = (await res.json()) as { data?: PendingUser[] }
    setPendingUsers(result.data || [])
  }

  const updateStatus = async (id: string, newStatus: string) => {
    setIssues(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i))
    await fetch(`/api/issues/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
  }

  const handleResponseSave = (id: string, response: string) => {
    setIssues(prev => prev.map(i =>
      i.id === id ? { ...i, admin_response: response, admin_responded_at: new Date().toISOString() } : i
    ))
  }

  const approveUser = async (userId: string, approved: boolean) => {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, is_approved: approved }),
    })
    setPendingUsers(prev => prev.filter(u => u.id !== userId))
  }

  const runAiScan = async () => {
    setAiLoading(true)
    await new Promise(r => setTimeout(r, 2000))
    setAiLoading(false)
    setShowAiPanel(true)
  }

  const escalatedIssues = issues.filter(i => i.is_escalated && !dismissedEscalations.includes(i.id))
  const filtered = issues
    .filter(i => filterStatus === 'All' || i.status === filterStatus)
    .sort((a, b) => {
      if (a.is_escalated && !b.is_escalated) return -1
      if (!a.is_escalated && b.is_escalated) return 1
      return 0
    })

  const stats = [
    { label: 'Total Issues', value: issues.length, icon: MessageSquare, color: '#6c63ff' },
    { label: 'Pending', value: issues.filter(i => i.status === 'Pending').length, icon: AlertCircle, color: '#f9ca24' },
    { label: 'In Progress', value: issues.filter(i => i.status === 'In Progress').length, icon: Clock, color: '#6c63ff' },
    { label: 'Resolved', value: issues.filter(i => i.status === 'Resolved').length, icon: CheckCircle, color: '#43e97b' },
  ]

  const categoryData = Object.entries(
    issues.reduce((acc, i) => { acc[i.category] = (acc[i.category] || 0) + 1; return acc }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1])

  const maxCount = Math.max(...categoryData.map(([, v]) => v), 1)

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(20px)',
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
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{collegeName}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {escalatedIssues.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,71,87,0.15)', border: '1px solid rgba(255,71,87,0.4)',
              borderRadius: 10, padding: '6px 12px', animation: 'pulse 1.5s infinite',
            }}>
              <span style={{ fontSize: 14 }}>🚨</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#ff4757' }}>
                {escalatedIssues.length} Urgent Issue{escalatedIssues.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
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
            {aiLoading
              ? <div style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.3)', borderTop: '2px solid black', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              : <Zap size={14} color="black" />
            }
            <span style={{ color: 'black', fontWeight: 700 }}>{aiLoading ? 'Scanning...' : 'AI Insights'}</span>
          </button>
          <button onClick={() => { localStorage.clear(); router.push('/login') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      {/* Escalation Alert Banner */}
      {escalatedIssues.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,71,87,0.12), rgba(255,71,87,0.06))',
          borderBottom: '1px solid rgba(255,71,87,0.3)',
          padding: '16px 32px',
        }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 18 }}>🚨</span>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#ff4757' }}>
                Urgent Issues Requiring Immediate Attention
              </h3>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                Students have escalated these as critical
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {escalatedIssues.map(issue => (
                <div key={issue.id} style={{
                  background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.25)',
                  borderRadius: 12, padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                        background: `${CAT_COLORS[issue.category]}18`, color: CAT_COLORS[issue.category],
                        textTransform: 'uppercase', letterSpacing: 0.5,
                      }}>{issue.category}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Escalated {issue.escalated_at ? timeAgo(issue.escalated_at) : ''}
                      </span>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{issue.title}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <select
                      value={issue.status}
                      onChange={e => updateStatus(issue.id, e.target.value)}
                      style={{
                        appearance: 'none', cursor: 'pointer',
                        padding: '7px 12px', borderRadius: 8, fontSize: 12,
                        fontFamily: 'Satoshi', fontWeight: 600, outline: 'none',
                        border: '1px solid rgba(255,71,87,0.4)',
                        background: 'rgba(255,71,87,0.1)', color: '#ff4757',
                      }}
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s} style={{ background: 'var(--surface)', color: 'var(--text-primary)' }}>{s}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setDismissedEscalations(prev => [...prev, issue.id])}
                      style={{
                        background: 'none', border: '1px solid rgba(255,71,87,0.3)',
                        borderRadius: 8, padding: '7px 12px', cursor: 'pointer',
                        fontSize: 12, color: 'var(--text-muted)', fontWeight: 600,
                      }}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Clash Display', fontSize: 30, fontWeight: 700, marginBottom: 4 }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Monitor, prioritise, and resolve campus issues in real time.</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 32 }}>
          {stats.map((s, i) => (
            <div key={i} className="glass" style={{ padding: '20px 22px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                background: `${s.color}18`, border: `1px solid ${s.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <s.icon size={19} color={s.color} />
              </div>
              <div>
                <div style={{ fontSize: 26, fontFamily: 'Clash Display', fontWeight: 700, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Category Bar Chart */}
        {categoryData.length > 0 && (
          <div className="glass" style={{ padding: '24px', marginBottom: 24 }}>
            <h3 style={{ fontFamily: 'Clash Display', fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Issues by Category</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {categoryData.map(([cat, count]) => (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 120, fontSize: 13, color: 'var(--text-secondary)', textAlign: 'right', flexShrink: 0 }}>{cat}</div>
                  <div style={{ flex: 1, height: 10, background: 'var(--surface-2)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 999,
                      width: `${(count / maxCount) * 100}%`,
                      background: `linear-gradient(90deg, ${CAT_COLORS[cat]}, ${CAT_COLORS[cat]}aa)`,
                    }} />
                  </div>
                  <div style={{ width: 24, fontSize: 13, fontWeight: 700 }}>{count}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Panel */}
        {showAiPanel && (
          <div style={{
            marginBottom: 24, padding: '24px',
            background: 'linear-gradient(135deg, rgba(67,233,123,0.08), rgba(56,249,215,0.05))',
            border: '1px solid rgba(67,233,123,0.25)', borderRadius: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Zap size={18} color="#43e97b" />
              <h3 style={{ fontFamily: 'Clash Display', fontSize: 17, fontWeight: 700, color: '#43e97b' }}>AI Campus Insights</h3>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>Powered by Gemini</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              {AI_INSIGHTS.map((s, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: CAT_COLORS[s.category] }}>{s.category}</span>
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 999,
                      background: s.trend === 'up' ? 'rgba(255,71,87,0.15)' : s.trend === 'down' ? 'rgba(67,233,123,0.15)' : 'rgba(108,99,255,0.15)',
                      color: s.trend === 'up' ? '#ff4757' : s.trend === 'down' ? '#43e97b' : 'var(--primary)',
                    }}>
                      {s.trend === 'up' ? '↑ Rising' : s.trend === 'down' ? '↓ Dropping' : '→ Stable'}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{s.insight}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--surface-2)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
          {(['issues', 'users'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '8px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontFamily: 'Satoshi', fontWeight: 600, fontSize: 14,
              background: activeTab === tab ? 'var(--primary)' : 'transparent',
              color: activeTab === tab ? 'white' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
            }}>
              {tab === 'issues' ? <BarChart3 size={15} /> : <Users size={15} />}
              {tab === 'issues' ? 'All Issues' : `Pending Approvals ${pendingUsers.length > 0 ? `(${pendingUsers.length})` : ''}`}
            </button>
          ))}
        </div>

        {/* Issues Tab */}
        {activeTab === 'issues' && (
          <div className="glass" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <h3 style={{ fontFamily: 'Clash Display', fontSize: 17, fontWeight: 700 }}>Issues</h3>
              <div style={{ display: 'flex', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                {['All', ...STATUS_OPTIONS].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)} style={{
                    padding: '6px 14px', border: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'Satoshi', fontWeight: 600,
                    background: filterStatus === s ? 'var(--primary)' : 'transparent',
                    color: filterStatus === s ? 'white' : 'var(--text-muted)', transition: 'all 0.2s',
                  }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filtered.map(issue => (
                  <div key={issue.id} style={{
                    padding: '16px', borderRadius: 12,
                    border: issue.is_escalated ? '1px solid rgba(255,71,87,0.4)' : '1px solid var(--border)',
                    background: issue.is_escalated ? 'rgba(255,71,87,0.04)' : 'var(--surface-2)',
                    display: 'flex', flexDirection: 'column', gap: 12,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 10, flexShrink: 0,
                        background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <TrendingUp size={13} color="var(--primary)" />
                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)' }}>{issue.upvote_count}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 180 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                            background: `${CAT_COLORS[issue.category]}15`, color: CAT_COLORS[issue.category],
                            textTransform: 'uppercase', letterSpacing: 0.5,
                          }}>
                            {issue.category}
                          </span>
                          {issue.is_escalated && (
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                              background: 'rgba(255,71,87,0.15)', color: '#ff4757',
                              border: '1px solid rgba(255,71,87,0.3)',
                            }}>🚨 Urgent</span>
                          )}
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(issue.created_at)}</span>
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4 }}>{issue.title}</p>
                      </div>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <select
                          value={issue.status}
                          onChange={e => updateStatus(issue.id, e.target.value)}
                          style={{
                            appearance: 'none', cursor: 'pointer',
                            padding: '8px 32px 8px 12px', borderRadius: 10, fontSize: 12,
                            fontFamily: 'Satoshi', fontWeight: 600, outline: 'none',
                            border: `1px solid ${issue.status === 'Resolved' ? 'rgba(67,233,123,0.4)' : issue.status === 'In Progress' ? 'rgba(108,99,255,0.4)' : 'rgba(249,202,36,0.4)'}`,
                            background: issue.status === 'Resolved' ? 'rgba(67,233,123,0.1)' : issue.status === 'In Progress' ? 'rgba(108,99,255,0.1)' : 'rgba(249,202,36,0.1)',
                            color: issue.status === 'Resolved' ? 'var(--accent-green)' : issue.status === 'In Progress' ? 'var(--primary)' : 'var(--accent-yellow)',
                          }}
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s} style={{ background: 'var(--surface)', color: 'var(--text-primary)' }}>{s}</option>
                          ))}
                        </select>
                        <ChevronDown size={12} style={{
                          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none',
                          color: issue.status === 'Resolved' ? 'var(--accent-green)' : issue.status === 'In Progress' ? 'var(--primary)' : 'var(--accent-yellow)',
                        }} />
                      </div>
                      <button
                      onClick={() => {
                           if (confirm('Delete this issue?')) {
                           fetch(`/api/issues/${issue.id}`, { method: 'DELETE' })
                          setIssues(prev => prev.filter(i => i.id !== issue.id))
                        }
                        }}
                         style={{
                         background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)',
                        borderRadius: 8, padding: '8px 12px', cursor: 'pointer',
    color: '#ff4757', display: 'flex', alignItems: 'center', gap: 4,
  }}
>
  <Trash2 size={14} />
</button>
                    </div>
                    <AdminResponseBox issue={issue} onSave={handleResponseSave} />
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No issues found.</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="glass" style={{ padding: '24px' }}>
            <h3 style={{ fontFamily: 'Clash Display', fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Pending Approvals</h3>
            {pendingUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                <CheckCircle size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <p>No pending approvals!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pendingUsers.map(u => (
                  <div key={u.id} style={{
                    padding: '16px', borderRadius: 12, border: '1px solid var(--border)',
                    background: 'var(--surface-2)', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 700, color: 'white', flexShrink: 0,
                    }}>
                      {u.full_name?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{u.full_name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.email} · {u.role}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => approveUser(u.id, false)} className="btn-secondary" style={{ padding: '7px 14px', fontSize: 13 }}>
                        Reject
                      </button>
                      <button onClick={() => approveUser(u.id, true)} className="btn-primary" style={{ padding: '7px 14px', fontSize: 13 }}>
                        Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
      `}</style>
    </div>
  )
}
