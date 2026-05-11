'use client'
import { supabase } from '@/lib/supabase'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  MessageSquare, TrendingUp, Plus, Search,
  ChevronUp, Clock, CheckCircle, AlertCircle, Bell, LogOut,
  X, Send, BarChart2, ImageIcon, User, Siren
} from 'lucide-react'

const CATEGORIES = ['All', 'Mess & Food', 'Wi-Fi & Tech', 'Infrastructure', 'Safety', 'Academics', 'Mental Health', 'Other']

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

function ResolutionTracker({ issues }: { issues: any[] }) {
  const total = issues.length
  const resolved = issues.filter(i => i.status === 'Resolved').length
  const inProgress = issues.filter(i => i.status === 'In Progress').length
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0

  // Average resolution time in days
  const resolvedIssues = issues.filter(i => i.status === 'Resolved' && i.admin_responded_at)
  const avgDays = resolvedIssues.length > 0
    ? Math.round(resolvedIssues.reduce((sum, i) => {
        const diff = new Date(i.admin_responded_at).getTime() - new Date(i.created_at).getTime()
        return sum + diff / (1000 * 60 * 60 * 24)
      }, 0) / resolvedIssues.length)
    : null

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(108,99,255,0.08), rgba(255,101,132,0.05))',
      border: '1px solid rgba(108,99,255,0.2)',
      borderRadius: 16, padding: '20px 24px', marginBottom: 24,
    }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 }}>
        Campus Resolution Tracker
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'Total Issues', value: total, color: 'var(--primary)' },
          { label: 'Resolved', value: resolved, color: '#43e97b' },
          { label: 'In Progress', value: inProgress, color: '#6c63ff' },
          { label: 'Resolution Rate', value: `${resolutionRate}%`, color: resolutionRate >= 50 ? '#43e97b' : '#f9ca24' },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontFamily: 'Clash Display', fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Overall progress</span>
          {avgDays !== null && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Avg. resolution: {avgDays}d</span>
          )}
        </div>
        <div style={{ height: 8, background: 'var(--surface-2)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 999,
            width: `${resolutionRate}%`,
            background: 'linear-gradient(90deg, #6c63ff, #43e97b)',
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>
    </div>
  )
}

function CommentsPanel({ issue, user, onClose }: { issue: any, user: any, onClose: () => void }) {
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [poll, setPoll] = useState<any>(null)
  const [votedOption, setVotedOption] = useState<string | null>(null)
  const [votingId, setVotingId] = useState<string | null>(null)

  useEffect(() => {
    fetchComments()
    fetchPoll()
  }, [issue.id])

  const fetchComments = async () => {
    setLoading(true)
    const res = await fetch(`/api/comments?issue_id=${issue.id}`)
    const result = await res.json()
    setComments(result.data || [])
    setLoading(false)
  }

  const fetchPoll = async () => {
    const res = await fetch(`/api/polls?issue_id=${issue.id}`)
    const result = await res.json()
    setPoll(result.data || null)
  }

  const submitComment = async () => {
    if (!newComment.trim()) return
    setSubmitting(true)
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issue_id: issue.id, content: newComment }),
    })
    const result = await res.json()
    if (result.data) setComments(prev => [...prev, result.data])
    setNewComment('')
    setSubmitting(false)
  }

  const votePoll = async (optionId: string) => {
    if (votedOption || !user) return
    setVotingId(optionId)
    const res = await fetch('/api/polls/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ poll_id: poll.id, option_id: optionId, user_id: user.id }),
    })
    const result = await res.json()
    if (result.success) {
      setVotedOption(optionId)
      setPoll((prev: any) => ({
        ...prev,
        poll_options: prev.poll_options.map((o: any) =>
          o.id === optionId ? { ...o, vote_count: o.vote_count + 1 } : o
        )
      }))
    }
    setVotingId(null)
  }

  const totalVotes = poll?.poll_options?.reduce((sum: number, o: any) => sum + o.vote_count, 0) || 0

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 640,
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '20px 20px 0 0',
        maxHeight: '85vh', display: 'flex', flexDirection: 'column',
        animation: 'slideUp 0.3s ease',
      }}>
        <div style={{
          padding: '20px 24px 16px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                background: `${CAT_COLORS[issue.category]}18`, color: CAT_COLORS[issue.category],
                border: `1px solid ${CAT_COLORS[issue.category]}40`, textTransform: 'uppercase', letterSpacing: 0.5,
              }}>{issue.category}</span>
              <StatusBadge status={issue.status} />
              {issue.is_escalated && (
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                  background: 'rgba(255,71,87,0.15)', color: '#ff4757',
                  border: '1px solid rgba(255,71,87,0.3)', display: 'inline-flex', alignItems: 'center', gap: 4,
                }}>
                  🚨 Escalated
                </span>
              )}
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4 }}>{issue.title}</h3>
            {issue.description && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>{issue.description}</p>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'var(--surface-2)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0 }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {issue.image_url && (
            <img src={issue.image_url} alt="Issue" style={{ width: '100%', borderRadius: 12, marginBottom: 16, maxHeight: 240, objectFit: 'cover' }} />
          )}

          {poll && (
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <BarChart2 size={14} color="var(--primary)" />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Poll</span>
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>{poll.question}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {poll.poll_options?.map((opt: any) => {
                  const pct = totalVotes > 0 ? Math.round((opt.vote_count / totalVotes) * 100) : 0
                  const isVoted = votedOption === opt.id
                  const showResults = !!votedOption
                  return (
                    <button key={opt.id} onClick={() => !votedOption && votePoll(opt.id)} disabled={!!votedOption || votingId === opt.id} style={{
                      position: 'relative', overflow: 'hidden', padding: '10px 14px', borderRadius: 10, textAlign: 'left',
                      border: `1px solid ${isVoted ? 'var(--primary)' : 'var(--border)'}`,
                      background: isVoted ? 'rgba(108,99,255,0.1)' : 'var(--surface)',
                      cursor: votedOption ? 'default' : 'pointer', transition: 'all 0.2s',
                    }}>
                      {showResults && (
                        <div style={{
                          position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`,
                          background: isVoted ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.04)',
                          transition: 'width 0.5s ease',
                        }} />
                      )}
                      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: isVoted ? 'var(--primary)' : 'var(--text-secondary)' }}>{opt.option_text}</span>
                        {showResults && <span style={{ fontSize: 12, fontWeight: 700, color: isVoted ? 'var(--primary)' : 'var(--text-muted)' }}>{pct}%</span>}
                      </div>
                    </button>
                  )
                })}
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
                {totalVotes} vote{totalVotes !== 1 ? 's' : ''} {!votedOption && '· Tap to vote'}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <MessageSquare size={14} color="var(--text-muted)" />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {comments.length} Comment{comments.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: 13 }}>Loading comments...</div>
          ) : comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
              <MessageSquare size={28} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
              <p style={{ fontSize: 13 }}>No comments yet. Be the first!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {comments.map(comment => (
                <div key={comment.id} style={{ background: 'var(--surface-2)', borderRadius: 12, padding: '12px 14px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)' }}>Anonymous</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(comment.created_at)}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '14px 24px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            placeholder="Add an anonymous comment..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment() } }}
            rows={2} className="input-dark"
            style={{ flex: 1, resize: 'none', fontSize: 13 }}
          />
          <button onClick={submitComment} disabled={submitting || !newComment.trim()} className="btn-primary" style={{ padding: '10px 14px', flexShrink: 0 }}>
            <Send size={15} />
          </button>
        </div>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  )
}

export default function FeedPage() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [issues, setIssues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newCat, setNewCat] = useState('Mess & Food')
  const [submitting, setSubmitting] = useState(false)
  const [sortBy, setSortBy] = useState<'trending' | 'recent'>('trending')
  const [user, setUser] = useState<any>(null)
  const [collegeId, setCollegeId] = useState<string | null>(null)
  const [collegeName, setCollegeName] = useState('')
  const [selectedIssue, setSelectedIssue] = useState<any>(null)
  const [addPoll, setAddPoll] = useState(false)
  const [pollQuestion, setPollQuestion] = useState('')
  const [pollOptions, setPollOptions] = useState(['', ''])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [escalating, setEscalating] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const channel = supabase
      .channel('issues')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'issues' }, (payload) => {
        setIssues(prev => prev.map(i => i.id === payload.new.id ? { ...i, ...payload.new } : i))
      })
      .subscribe()

    const stored = localStorage.getItem('user')
    const cid = localStorage.getItem('college_id')
    if (!stored || !cid) { router.push('/login'); supabase.removeChannel(channel); return }
    const u = JSON.parse(stored)
    setUser(u)
    setCollegeId(cid)
    setCollegeName(u.colleges?.name || 'My Campus')
    fetchIssues(cid, activeCategory)

    return () => { supabase.removeChannel(channel) }
  }, [])

  const fetchIssues = async (cid: string, category: string) => {
    setLoading(true)
    const params = new URLSearchParams({ college_id: cid })
    if (category !== 'All') params.append('category', category)
    const res = await fetch(`/api/issues?${params}`)
    const result = await res.json()
    setIssues(result.data || [])
    setLoading(false)
  }

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat)
    if (collegeId) fetchIssues(collegeId, cat)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null
    setUploadingImage(true)
    const fileName = `${Date.now()}-${imageFile.name}`
    const { data, error } = await supabase.storage.from('issue-images').upload(fileName, imageFile)
    setUploadingImage(false)
    if (error) { console.error('Upload error:', error); return null }
    const { data: urlData } = supabase.storage.from('issue-images').getPublicUrl(fileName)
    return urlData.publicUrl
  }

  const toggleUpvote = async (issueId: string, currentlyUpvoted: boolean) => {
    if (!user) return
    setIssues(prev => prev.map(i =>
      i.id === issueId
        ? { ...i, upvoted: !currentlyUpvoted, upvote_count: currentlyUpvoted ? i.upvote_count - 1 : i.upvote_count + 1 }
        : i
    ))
    await fetch('/api/upvote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issue_id: issueId, user_id: user.id }),
    })
  }

  const escalateIssue = async (issueId: string, currentlyEscalated: boolean) => {
    if (currentlyEscalated) return // can't de-escalate
    setEscalating(issueId)
    setIssues(prev => prev.map(i => i.id === issueId ? { ...i, is_escalated: true } : i))
    await fetch(`/api/issues/${issueId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_escalated: true, escalated_at: new Date().toISOString() }),
    })
    setEscalating(null)
  }

  const submitIssue = async () => {
    if (!newTitle.trim() || !collegeId) return
    setSubmitting(true)

    let image_url = null
    if (imageFile) image_url = await uploadImage()

    const res = await fetch('/api/issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, description: newDesc, category: newCat, college_id: collegeId, image_url, user_id: user?.id }),
    })
    const result = await res.json()

    if (result.data) {
      if (addPoll && pollQuestion.trim() && pollOptions.filter(o => o.trim()).length >= 2) {
        await fetch('/api/polls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ issue_id: result.data.id, question: pollQuestion, options: pollOptions.filter(o => o.trim()) }),
        })
      }
      setIssues(prev => [{ ...result.data, upvoted: false, upvote_count: 0 }, ...prev])
    }

    setShowModal(false)
    setNewTitle('')
    setNewDesc('')
    setAddPoll(false)
    setPollQuestion('')
    setPollOptions(['', ''])
    setImageFile(null)
    setImagePreview(null)
    setSubmitting(false)
  }

  const filtered = issues
    .filter(i => i.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (a.is_escalated && !b.is_escalated) return -1
      if (!a.is_escalated && b.is_escalated) return 1
      return sortBy === 'trending' ? b.upvote_count - a.upvote_count : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

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
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10, 10, 15, 0.9)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 32px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
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
          <span style={{
            marginLeft: 8, fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 999,
            background: 'rgba(108,99,255,0.15)', color: 'var(--primary)', border: '1px solid rgba(108,99,255,0.3)',
          }}>{collegeName}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Bell size={20} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
          <button onClick={() => router.push('/myposts')} style={{
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '8px 14px', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <User size={14} /> My Posts
          </button>
          <button className="btn-primary" onClick={() => setShowModal(true)} style={{ padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={15} /> New Issue
          </button>
          <button onClick={() => { localStorage.clear(); router.push('/login') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Clash Display', fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Campus Feed</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Upvote issues that matter to you. Your identity stays hidden.</p>
        </div>

        {/* Resolution Tracker */}
        {!loading && issues.length > 0 && <ResolutionTracker issues={issues} />}

        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input className="input-dark" placeholder="Search issues..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 42 }} />
          </div>
          <div style={{ display: 'flex', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            {(['trending', 'recent'] as const).map(s => (
              <button key={s} onClick={() => setSortBy(s)} style={{
                padding: '0 16px', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'Satoshi', fontWeight: 600,
                background: sortBy === s ? 'var(--primary)' : 'transparent',
                color: sortBy === s ? 'white' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
              }}>
                {s === 'trending' ? <TrendingUp size={14} /> : <Clock size={14} />}
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => handleCategoryChange(cat)} style={{
              padding: '7px 14px', borderRadius: 999, whiteSpace: 'nowrap',
              border: `1px solid ${activeCategory === cat ? (CAT_COLORS[cat] || 'var(--primary)') : 'var(--border)'}`,
              background: activeCategory === cat ? `${CAT_COLORS[cat] || 'var(--primary)'}18` : 'var(--surface-2)',
              color: activeCategory === cat ? (CAT_COLORS[cat] || 'var(--primary)') : 'var(--text-muted)',
              fontSize: 13, fontFamily: 'Satoshi', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
            <div style={{
              width: 36, height: 36, border: '3px solid var(--border)', borderTop: '3px solid var(--primary)',
              borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
            }} />
            Loading issues...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(issue => (
              <div key={issue.id} className="glass card-hover" style={{
                padding: '20px', display: 'flex', gap: 16,
                border: issue.is_escalated ? '1px solid rgba(255,71,87,0.4)' : undefined,
                background: issue.is_escalated ? 'rgba(255,71,87,0.03)' : undefined,
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <button onClick={() => toggleUpvote(issue.id, issue.upvoted)} style={{
                    width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: issue.upvoted ? 'rgba(108,99,255,0.2)' : 'var(--surface-2)',
                    color: issue.upvoted ? 'var(--primary)' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                  }}>
                    <ChevronUp size={18} />
                  </button>
                  <span style={{ fontSize: 14, fontWeight: 700, color: issue.upvoted ? 'var(--primary)' : 'var(--text-secondary)' }}>
                    {issue.upvote_count}
                  </span>
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
                    {issue.is_escalated && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                        background: 'rgba(255,71,87,0.15)', color: '#ff4757',
                        border: '1px solid rgba(255,71,87,0.3)', display: 'inline-flex', alignItems: 'center', gap: 3,
                      }}>
                        🚨 Urgent
                      </span>
                    )}
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{timeAgo(issue.created_at)}</span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, lineHeight: 1.4 }}>{issue.title}</h3>
                  {issue.description && (
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 8 }}>{issue.description}</p>
                  )}
                  {issue.admin_response && (
                    <div style={{
                      background: 'rgba(67,233,123,0.06)', border: '1px solid rgba(67,233,123,0.2)',
                      borderRadius: 10, padding: '10px 14px', marginBottom: 8,
                    }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#43e97b', display: 'block', marginBottom: 4 }}>✓ Official Response</span>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{issue.admin_response}</p>
                    </div>
                  )}
                  {issue.image_url && (
                    <img src={issue.image_url} alt="Issue" style={{ width: '100%', borderRadius: 10, marginBottom: 10, maxHeight: 200, objectFit: 'cover' }} />
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {issue.users?.anon_id || 'Anonymous'}
                    </span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {/* Escalate button */}
                      {!issue.is_escalated && (
                        <button
                          onClick={() => escalateIssue(issue.id, issue.is_escalated)}
                          disabled={escalating === issue.id}
                          title="Mark as urgent"
                          style={{
                            background: 'none', border: '1px solid rgba(255,71,87,0.3)', borderRadius: 8,
                            padding: '5px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                            color: '#ff4757', display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.2s',
                          }}
                        >
                          🚨 Escalate
                        </button>
                      )}
                      <button onClick={() => setSelectedIssue(issue)} style={{
                        background: 'none', border: '1px solid var(--border)', borderRadius: 8,
                        padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                        color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.2s',
                      }}>
                        <MessageSquare size={12} /> Comment
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
                <MessageSquare size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                <p style={{ fontSize: 16, fontWeight: 600 }}>No issues yet</p>
                <p style={{ fontSize: 14, marginTop: 4 }}>Be the first to raise one.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedIssue && <CommentsPanel issue={selectedIssue} user={user} onClose={() => setSelectedIssue(null)} />}

      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }} onClick={() => setShowModal(false)}>
          <div className="glass" style={{ width: '100%', maxWidth: 520, padding: '32px', borderRadius: 20, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'Clash Display', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Raise an Issue</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>Your identity will remain completely anonymous.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Category</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {CATEGORIES.filter(c => c !== 'All').map(cat => (
                    <button key={cat} onClick={() => setNewCat(cat)} style={{
                      padding: '6px 12px', borderRadius: 999, fontSize: 12, fontFamily: 'Satoshi', fontWeight: 600, cursor: 'pointer',
                      border: `1px solid ${newCat === cat ? CAT_COLORS[cat] : 'var(--border)'}`,
                      background: newCat === cat ? `${CAT_COLORS[cat]}18` : 'var(--surface-2)',
                      color: newCat === cat ? CAT_COLORS[cat] : 'var(--text-muted)', transition: 'all 0.2s',
                    }}>{cat}</button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Issue Title</label>
                <input className="input-dark" placeholder="Summarise your issue in one line" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Description</label>
                <textarea className="input-dark" placeholder="Describe the issue in detail..." value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={4} style={{ resize: 'vertical' }} />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Attach Image (Optional)</label>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
                {imagePreview ? (
                  <div style={{ position: 'relative' }}>
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', borderRadius: 12, maxHeight: 180, objectFit: 'cover' }} />
                    <button onClick={() => { setImageFile(null); setImagePreview(null) }} style={{
                      position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)', border: 'none',
                      borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => fileInputRef.current?.click()} style={{
                    width: '100%', padding: '20px', borderRadius: 12,
                    border: '2px dashed var(--border)', background: 'var(--surface-2)',
                    cursor: 'pointer', color: 'var(--text-muted)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  }}>
                    <ImageIcon size={24} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Click to upload image</span>
                    <span style={{ fontSize: 11 }}>PNG, JPG up to 10MB</span>
                  </button>
                )}
              </div>

              <div>
                <button onClick={() => setAddPoll(!addPoll)} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: addPoll ? 'rgba(108,99,255,0.1)' : 'var(--surface-2)',
                  border: `1px solid ${addPoll ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: 10, padding: '10px 14px', cursor: 'pointer', width: '100%',
                  color: addPoll ? 'var(--primary)' : 'var(--text-muted)',
                  fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
                }}>
                  <BarChart2 size={15} />
                  {addPoll ? 'Remove Poll' : 'Add a Poll'}
                </button>

                {addPoll && (
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input className="input-dark" placeholder="Poll question..." value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} />
                    {pollOptions.map((opt, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8 }}>
                        <input
                          className="input-dark"
                          placeholder={`Option ${i + 1}`}
                          value={opt}
                          onChange={e => { const updated = [...pollOptions]; updated[i] = e.target.value; setPollOptions(updated) }}
                          style={{ flex: 1 }}
                        />
                        {pollOptions.length > 2 && (
                          <button onClick={() => setPollOptions(pollOptions.filter((_, idx) => idx !== i))}
                            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '0 10px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                    {pollOptions.length < 5 && (
                      <button onClick={() => setPollOptions([...pollOptions, ''])}
                        style={{ background: 'none', border: '1px dashed var(--border)', borderRadius: 8, padding: '8px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}>
                        + Add Option
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button className="btn-primary" onClick={submitIssue} disabled={submitting || uploadingImage} style={{ flex: 1, justifyContent: 'center', display: 'flex', gap: 6 }}>
                  {submitting || uploadingImage ? 'Posting...' : 'Post Anonymously'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
