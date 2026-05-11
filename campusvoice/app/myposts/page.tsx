'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  MessageSquare, ChevronUp, Clock, CheckCircle,
  AlertCircle, ArrowLeft, Trash2
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

function StatusBadge({ status }: { status: string }) {
  const cls = status === 'Resolved' ? 'badge-resolved' : status === 'In Progress' ? 'badge-progress' : 'badge-pending'
  const icon = status === 'Resolved' ? <CheckCircle size={12} /> : status === 'In Progress' ? <Clock size={12} /> : <AlertCircle size={12} />
  return (
    <span className={`category-pill ${cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {icon} {status}
    </span>
  )
}

export default function MyPostsPage() {
  const router = useRouter()
  const [issues, setIssues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) { router.push('/login'); return }
    const u = JSON.parse(stored)
    setUser(u)
    fetchMyIssues(u.id)
  }, [])

  const fetchMyIssues = async (userId: string) => {
    setLoading(true)
    const res = await fetch(`/api/issues?user_id=${userId}`)
    const result = await res.json()
    setIssues(result.data || [])
    setLoading(false)
  }

  const deleteIssue = async (issueId: string) => {
    setDeletingId(issueId)
    await fetch(`/api/issues/${issueId}`, { method: 'DELETE' })
    setIssues(prev => prev.filter(i => i.id !== issueId))
    setConfirmDeleteId(null)
    setDeletingId(null)
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  const resolved = issues.filter(i => i.status === 'Resolved').length
  const inProgress = issues.filter(i => i.status === 'In Progress').length
  const pending = issues.filter(i => i.status === 'Pending').length

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10, 10, 15, 0.9)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 32px', height: 64,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <button
          onClick={() => router.push('/feed')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft size={18} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Clash Display', fontSize: 28, fontWeight: 700, marginBottom: 4 }}>My Posts</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Track the status of issues you've raised.</p>
        </div>

        {/* Stats */}
        {!loading && issues.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
            {[
              { label: 'Pending', value: pending, color: '#f9ca24', icon: <AlertCircle size={16} /> },
              { label: 'In Progress', value: inProgress, color: '#6c63ff', icon: <Clock size={16} /> },
              { label: 'Resolved', value: resolved, color: '#43e97b', icon: <CheckCircle size={16} /> },
            ].map(s => (
              <div key={s.label} className="glass" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  background: `${s.color}18`, border: `1px solid ${s.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color,
                }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: 22, fontFamily: 'Clash Display', fontWeight: 700, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Issues List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
            <div style={{
              width: 36, height: 36, border: '3px solid var(--border)', borderTop: '3px solid var(--primary)',
              borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
            }} />
            Loading your posts...
          </div>
        ) : issues.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)' }}>
            <MessageSquare size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
            <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No posts yet</p>
            <p style={{ fontSize: 14, marginBottom: 24 }}>You haven't raised any issues yet.</p>
            <button className="btn-primary" onClick={() => router.push('/feed')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Go to Feed
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {issues.map(issue => (
              <div key={issue.id} className="glass" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  {/* Upvote count */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <ChevronUp size={18} color="var(--primary)" />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>{issue.upvote_count}</span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                        background: `${CAT_COLORS[issue.category]}18`, color: CAT_COLORS[issue.category],
                        border: `1px solid ${CAT_COLORS[issue.category]}40`, textTransform: 'uppercase', letterSpacing: 0.5,
                      }}>
                        {issue.category}
                      </span>
                      <StatusBadge status={issue.status} />
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{timeAgo(issue.created_at)}</span>
                    </div>

                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, lineHeight: 1.4 }}>{issue.title}</h3>
                    {issue.description && (
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 8 }}>{issue.description}</p>
                    )}

                    {issue.image_url && (
                      <div style={{ marginTop: 10 }}>
                        <img src={issue.image_url} alt="Issue" style={{ width: '100%', borderRadius: 10, maxHeight: 200, objectFit: 'cover' }} />
                      </div>
                    )}

                    {/* Status indicator bar */}
                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                      {['Pending', 'In Progress', 'Resolved'].map((s, idx) => {
                        const currentIdx = ['Pending', 'In Progress', 'Resolved'].indexOf(issue.status)
                        const active = idx <= currentIdx
                        const colors = ['#f9ca24', '#6c63ff', '#43e97b']
                        return (
                          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                            <div style={{
                              height: 4, flex: 1, borderRadius: 999,
                              background: active ? colors[idx] : 'var(--border)',
                              transition: 'background 0.3s',
                            }} />
                            {idx === 2 && (
                              <span style={{ fontSize: 11, color: active ? '#43e97b' : 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                {issue.status}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Delete button */}
                    <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                      {confirmDeleteId === issue.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Delete this post?</span>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => deleteIssue(issue.id)}
                            disabled={deletingId === issue.id}
                            style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.4)', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontSize: 12, color: '#ff4757', fontWeight: 600 }}
                          >
                            {deletingId === issue.id ? 'Deleting...' : 'Yes, Delete'}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(issue.id)}
                          style={{
                            background: 'none', border: '1px solid rgba(255,71,87,0.3)', borderRadius: 8,
                            padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                            color: '#ff4757', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.2s',
                          }}
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
