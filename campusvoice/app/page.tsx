'use client'


import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Shield, TrendingUp, BarChart3, CheckCircle,
  ArrowRight, MessageSquare, Users, Zap, Eye, ChevronRight
} from 'lucide-react'


const categories = ['Mess & Food', 'Wi-Fi & Tech', 'Infrastructure', 'Safety', 'Academics', 'Mental Health']


const mockIssues = [
  { category: 'Mess & Food', title: 'Mess food quality has drastically dropped this semester', upvotes: 247, status: 'In Progress' },
  { category: 'Safety', title: 'Street lights near Block C are broken for 2 weeks', upvotes: 189, status: 'Pending' },
  { category: 'Wi-Fi & Tech', title: 'Hostel Wi-Fi disconnects every night after 11pm', upvotes: 312, status: 'Resolved' },
  { category: 'Mental Health', title: 'Need a dedicated counsellor available on weekends', upvotes: 156, status: 'Pending' },
]


const stats = [
  { value: '12,400+', label: 'Student Voices' },
  { value: '340+', label: 'Issues Resolved' },
  { value: '48hrs', label: 'Avg Resolution Time' },
  { value: '98%', label: 'Anonymity Guaranteed' },
]


const features = [
  {
    icon: Eye,
    title: 'Fully Anonymous',
    desc: 'Your identity is never revealed. Speak freely without fear of backlash or identification.',
    color: '#6c63ff',
  },
  {
    icon: TrendingUp,
    title: 'Upvote & Trend',
    desc: 'The most important issues rise to the top. Collective voice drives admin priority.',
    color: '#ff6584',
  },
  {
    icon: BarChart3,
    title: 'AI-Powered Insights',
    desc: 'Gemini AI auto-categorizes issues and gives admins smart summaries to act fast.',
    color: '#43e97b',
  },
  {
    icon: CheckCircle,
    title: 'Track Resolutions',
    desc: 'Watch your issue move from Pending → In Progress → Resolved in real time.',
    color: '#f9ca24',
  },
  {
    icon: Shield,
    title: 'College-Isolated',
    desc: 'Each college has its own private space. Only verified members can see your campus feed.',
    color: '#6c63ff',
  },
  {
    icon: Zap,
    title: 'Real-Time Updates',
    desc: 'Instant notifications when your issue status changes or gets a response from admin.',
    color: '#ff6584',
  },
]


function StatusBadge({ status }: { status: string }) {
  const cls =
    status === 'Resolved' ? 'badge-resolved' :
    status === 'In Progress' ? 'badge-progress' :
    'badge-pending'
  return (
    <span className={`category-pill ${cls}`}>{status}</span>
  )
}


function CategoryColor(cat: string) {
  const map: Record<string, string> = {
    'Mess & Food': '#f9ca24',
    'Wi-Fi & Tech': '#6c63ff',
    'Infrastructure': '#ff6584',
    'Safety': '#ff6584',
    'Academics': '#43e97b',
    'Mental Health': '#a29bfe',
  }
  return map[cat] || '#6c63ff'
}


export default function LandingPage() {
  const [mounted, setMounted] = useState(false)
  const [activeIssue, setActiveIssue] = useState(0)


  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setActiveIssue(prev => (prev + 1) % mockIssues.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])


  if (!mounted) return null


  return (
    <div className="min-h-screen gradient-bg" style={{ background: 'var(--background)' }}>


      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(10, 10, 15, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 40px',
        height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #6c63ff, #ff6584)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <MessageSquare size={16} color="white" />
          </div>
          <span style={{ fontFamily: 'Clash Display', fontWeight: 700, fontSize: 20, color: 'var(--text-primary)' }}>
            Campus<span style={{ color: 'var(--primary)' }}>Voice</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/login">
            <button className="btn-secondary" style={{ padding: '8px 20px', fontSize: 14 }}>Log In</button>
          </Link>
          <Link href="/signup">
            <button className="btn-primary" style={{ padding: '8px 20px', fontSize: 14 }}>Get Started</button>
          </Link>
        </div>
      </nav>


      {/* Hero */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '120px 40px 80px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background orbs */}
        <div style={{
          position: 'absolute', top: '15%', left: '10%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '15%', right: '10%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,101,132,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />


        <div style={{ maxWidth: 900, textAlign: 'center', position: 'relative' }}>
          {/* Badge */}
          <div className="animate-fade-in-up" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(108, 99, 255, 0.12)',
            border: '1px solid rgba(108, 99, 255, 0.3)',
            borderRadius: 999, padding: '6px 16px', marginBottom: 32,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', animation: 'pulse-glow 2s infinite' }} />
            <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, letterSpacing: 0.5 }}>
              Anonymous · Secure · Impactful
            </span>
          </div>


          <h1 className="animate-fade-in-up delay-100" style={{ fontSize: 'clamp(42px, 7vw, 80px)', fontWeight: 700, lineHeight: 1.2, marginBottom: 24 }}>
            Speak up safely.<br />
            <span className="gradient-text">Drive real change</span><br />
            on campus.
          </h1>


          <p className="animate-fade-in-up delay-200" style={{
            fontSize: 18, color: 'var(--text-secondary)', maxWidth: 580, margin: '0 auto 40px',
            lineHeight: 1.7,
          }}>
            CampusVoice gives every student a safe, anonymous space to raise issues — and gives administrators the AI-powered tools to act.
          </p>


          <div className="animate-fade-in-up delay-300" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup">
              <button className="btn-primary" style={{ fontSize: 16, padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 8 }}>
                Join Your Campus <ArrowRight size={18} />
              </button>
            </Link>
            <Link href="/login">
              <button className="btn-secondary" style={{ fontSize: 16, padding: '14px 32px' }}>
                Admin Login
              </button>
            </Link>
          </div>


          {/* Live issues ticker */}
          <div className="animate-fade-in-up delay-400 glass card-hover" style={{
            marginTop: 60, padding: '20px 24px', textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)',
              boxShadow: '0 0 10px var(--accent-green)', flexShrink: 0,
            }} />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
                Live Issue
              </div>
              <div style={{
                fontSize: 15, color: 'var(--text-primary)', fontWeight: 500,
                transition: 'all 0.5s ease',
              }}>
                {mockIssues[activeIssue].title}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <span style={{
                fontSize: 13, fontWeight: 700, color: 'var(--primary)',
                background: 'rgba(108,99,255,0.1)', padding: '4px 10px', borderRadius: 6,
              }}>
                ▲ {mockIssues[activeIssue].upvotes}
              </span>
              <StatusBadge status={mockIssues[activeIssue].status} />
            </div>
          </div>
        </div>
      </section>


      {/* Stats */}
      <section style={{ padding: '0 40px 100px' }}>
        <div style={{
          maxWidth: 900, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2,
          background: 'var(--border)', borderRadius: 20, overflow: 'hidden',
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background: 'var(--surface)', padding: '36px 24px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 36, fontFamily: 'Clash Display', fontWeight: 700, color: 'var(--primary)', marginBottom: 8 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* Features */}
      <section style={{ padding: '0 40px 120px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, marginBottom: 16 }}>
              Built for students.<br /><span className="gradient-text">Designed for change.</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
              Every feature exists for one reason — to make sure student voices actually lead to action.
            </p>
          </div>


          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {features.map((f, i) => (
              <div key={i} className="glass card-hover" style={{ padding: '28px 24px' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${f.color}20`, border: `1px solid ${f.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <f.icon size={20} color={f.color} />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8, fontFamily: 'Clash Display' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Categories */}
      <section style={{ padding: '0 40px 120px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, marginBottom: 16 }}>
            Every campus issue, <span className="gradient-text">one platform.</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 40 }}>
            From mess food to mental health — nothing is too big or too small to raise.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            {categories.map((cat, i) => (
              <div key={i} style={{
                padding: '10px 20px', borderRadius: 999,
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)',
                cursor: 'default', transition: 'all 0.3s',
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--primary)'
                  ;(e.currentTarget as HTMLDivElement).style.color = 'var(--primary)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
                  ;(e.currentTarget as HTMLDivElement).style.color = 'var(--text-secondary)'
                }}
              >
                {cat}
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* CTA */}
      <section style={{ padding: '0 40px 120px' }}>
        <div style={{
          maxWidth: 800, margin: '0 auto',
          background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(255,101,132,0.1))',
          border: '1px solid rgba(108,99,255,0.3)',
          borderRadius: 24, padding: '64px 48px', textAlign: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -60, right: -60,
            width: 200, height: 200, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(108,99,255,0.2), transparent)',
            pointerEvents: 'none',
          }} />
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, marginBottom: 16 }}>
            A campus that listens<br />
            <span className="gradient-text">is a campus that cares.</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 480, margin: '0 auto 36px', lineHeight: 1.7 }}>
            Join thousands of students already using CampusVoice to make their campus better — one issue at a time.
          </p>
          <Link href="/signup">
            <button className="btn-primary" style={{ fontSize: 16, padding: '14px 36px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Get Started Free <ChevronRight size={18} />
            </button>
          </Link>
        </div>
      </section>


      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)', padding: '32px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 6,
            background: 'linear-gradient(135deg, #6c63ff, #ff6584)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <MessageSquare size={12} color="white" />
          </div>
          <span style={{ fontFamily: 'Clash Display', fontWeight: 700, fontSize: 16 }}>
            Campus<span style={{ color: 'var(--primary)' }}>Voice</span>
          </span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Speak up safely. Drive real change on campus.
        </p>
      </footer>
    </div>
  )
}






