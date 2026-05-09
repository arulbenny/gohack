'use client'


import { useState } from 'react'
import Link from 'next/link'
import {
  MessageSquare, TrendingUp, Plus, Search, Filter,
  ChevronUp, Clock, CheckCircle, AlertCircle, Bell, LogOut, Image
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


const MOCK_ISSUES = [
  {
    id: 1, category: 'Mess & Food', status: 'In Progress',
    title: 'Mess food quality has drastically dropped this semester',
    desc: 'The vegetables are undercooked, portions are smaller, and the hygiene standards have gone down significantly. Multiple students have reported stomach issues.',
    upvotes: 247, comments: 34, time: '2h ago', upvoted: false,
  },
  {
    id: 2, category: 'Wi-Fi & Tech', status: 'Pending',
    title: 'Hostel Wi-Fi disconnects every night after 11pm',
    desc: 'For the past 3 weeks, the internet in Block A and B cuts off after 11pm and doesn\'t come back until morning. This affects students who study late.',
    upvotes: 312, comments: 41, time: '5h ago', upvoted: true,
  },
  {
    id: 3, category: 'Safety', status: 'Pending',
    title: 'Street lights near Block C are broken for 2 weeks',
    desc: 'The entire stretch from Block C to the library is pitch dark at night. Students, especially those returning from late labs, are at risk.',
    upvotes: 189, comments: 22, time: '1d ago', upvoted: false,
  },
  {
    id: 4, category: 'Mental Health', status: 'Resolved',
    title: 'Need a dedicated counsellor available on weekends',
    desc: 'The current counsellor is only available on weekdays. Many students only have free time on weekends and end up not getting support.',
    upvotes: 156, comments: 18, time: '2d ago', upvoted: false,
  },
  {
    id: 5, category: 'Academics', status: 'Pending',
    title: 'Exam schedule clashes with another department\'s internal',
    desc: 'Three courses have exams scheduled on the same day. This is unfair and creates unnecessary stress. A revised schedule is needed urgently.',
    upvotes: 98, comments: 11, time: '3d ago', upvoted: false,
  },
  {
    id: 6, category: 'Infrastructure', status: 'In Progress',
    title: 'Elevator in main block has been out of service for a month',
    desc: 'Students with mobility issues are struggling. The elevator has been broken since March and no official timeline for repair has been given.',
    upvotes: 134, comments: 9, time: '4d ago', upvoted: false,
  },
]


function StatusIcon({ status }: { status: string }) {
  if (status === 'Resolved') return <CheckCircle size={13} color="var(--accent-green)" />
  if (status === 'In Progress') return <Clock size={13} color="var(--primary)" />
  return <AlertCircle size={13} color="var(--accent-yellow)" />
}


function StatusBadge({ status }: { status: string }) {
  const cls = status === 'Resolved' ? 'badge-resolved' : status === 'In Progress' ? 'badge-progress' : 'badge-pending'
  return (
    <span className={`category-pill ${cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <StatusIcon status={status} /> {status}
    </span>
  )
}


export default function FeedPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [issues, setIssues] = useState(MOCK_ISSUES)
  const [showModal, setShowModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newCat, setNewCat] = useState('Mess & Food')
  const [sortBy, setSortBy] = useState<'trending' | 'recent'>('trending')


  const toggleUpvote = (id: number) => {
    setIssues(prev => prev.map(issue =>
      issue.id === id
        ? { ...issue, upvoted: !issue.upvoted, upvotes: issue.upvoted ? issue.upvotes - 1 : issue.upvotes + 1 }
        : issue
    ))
  }


  const submitIssue = () => {
    if (!newTitle.trim()) return
    const newIssue = {
      id: issues.length + 1,
      category: newCat,
      status: 'Pending',
      title: newTitle,
      desc: newDesc,
      upvotes: 1,
      comments: 0,
      time: 'Just now',
      upvoted: true,
    }
    setIssues([newIssue, ...issues])
    setShowModal(false)
    setNewTitle('')
    setNewDesc('')
  }


  const filtered = issues
    .filter(i => activeCategory === 'All' || i.category === activeCategory)
    .filter(i => i.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === 'trending' ? b.upvotes - a.upvotes : 0)


  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>


      {/* Navbar */}
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
          }}>VIT Vellore</span>
        </div>


        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', position: 'relative' }}>
            <Bell size={20} />
            <div style={{
              position: 'absolute', top: -2, right: -2, width: 8, height: 8,
              borderRadius: '50%', background: 'var(--accent)',
            }} />
          </button>
          <button
            className="btn-primary"
            onClick={() => setShowModal(true)}
            style={{ padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={15} /> New Issue
          </button>
          <Link href="/login">
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <LogOut size={18} />
            </button>
          </Link>
        </div>
      </nav>


      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>


        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Clash Display', fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
            Campus Feed
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Upvote issues that matter to you. Your identity stays hidden.
          </p>
        </div>


        {/* Search + Sort */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              className="input-dark"
              placeholder="Search issues..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 42 }}
            />
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


        {/* Categories */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
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


        {/* Issues */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(issue => (
            <div key={issue.id} className="glass card-hover" style={{ padding: '20px', display: 'flex', gap: 16 }}>
              {/* Upvote */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <button
                  onClick={() => toggleUpvote(issue.id)}
                  style={{
                    width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: issue.upvoted ? 'rgba(108,99,255,0.2)' : 'var(--surface-2)',
                    color: issue.upvoted ? 'var(--primary)' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s', transform: issue.upvoted ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  <ChevronUp size={18} />
                </button>
                <span style={{
                  fontSize: 14, fontWeight: 700,
                  color: issue.upvoted ? 'var(--primary)' : 'var(--text-secondary)',
                }}>
                  {issue.upvotes}
                </span>
              </div>


              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                    background: `${CAT_COLORS[issue.category]}18`,
                    color: CAT_COLORS[issue.category],
                    border: `1px solid ${CAT_COLORS[issue.category]}40`,
                    textTransform: 'uppercase', letterSpacing: 0.5,
                  }}>
                    {issue.category}
                  </span>
                  <StatusBadge status={issue.status} />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{issue.time}</span>
                </div>


                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, lineHeight: 1.4, color: 'var(--text-primary)' }}>
                  {issue.title}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 12 }}>
                  {issue.desc}
                </p>


                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MessageSquare size={13} /> {issue.comments} comments
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Anonymous Student
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>


        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
            <MessageSquare size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p style={{ fontSize: 16, fontWeight: 600 }}>No issues found</p>
            <p style={{ fontSize: 14, marginTop: 4 }}>Be the first to raise one.</p>
          </div>
        )}
      </div>


      {/* Post Issue Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }} onClick={() => setShowModal(false)}>
          <div
            className="glass"
            style={{ width: '100%', maxWidth: 520, padding: '32px', borderRadius: 20 }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ fontFamily: 'Clash Display', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
              Raise an Issue
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>
              Your identity will remain completely anonymous.
            </p>


            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Category */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Category
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {CATEGORIES.filter(c => c !== 'All').map(cat => (
                    <button key={cat} onClick={() => setNewCat(cat)} style={{
                      padding: '6px 12px', borderRadius: 999, fontSize: 12, fontFamily: 'Satoshi', fontWeight: 600, cursor: 'pointer',
                      border: `1px solid ${newCat === cat ? CAT_COLORS[cat] : 'var(--border)'}`,
                      background: newCat === cat ? `${CAT_COLORS[cat]}18` : 'var(--surface-2)',
                      color: newCat === cat ? CAT_COLORS[cat] : 'var(--text-muted)',
                      transition: 'all 0.2s',
                    }}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>


              {/* Title */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Issue Title
                </label>
                <input
                  className="input-dark"
                  placeholder="Summarise your issue in one line"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                />
              </div>


              {/* Description */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Description
                </label>
                <textarea
                  className="input-dark"
                  placeholder="Describe the issue in detail..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  rows={4}
                  style={{ resize: 'vertical' }}
                />
              </div>


              {/* Photo */}
              <div style={{
                border: '1px dashed var(--border)', borderRadius: 12,
                padding: '16px', textAlign: 'center', cursor: 'pointer',
                background: 'var(--surface-2)', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                color: 'var(--text-muted)', fontSize: 13,
              }}>
                <Image size={16} /> Attach a photo (optional)
              </div>


              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button className="btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={submitIssue} style={{ flex: 1, justifyContent: 'center', display: 'flex', gap: 6 }}>
                  Post Anonymously
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

