'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MessageSquare, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [showPass, setShowPass] = useState(false)
  const [role, setRole] = useState<'student' | 'admin'>('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error || 'Login failed.')
        setLoading(false)
        return
      }

      // Save user info to localStorage
      localStorage.setItem('user', JSON.stringify(result.data.user))
      localStorage.setItem('college_id', result.data.user.college_id)

      if (result.data.user.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/feed')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--background)', padding: '24px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '10%', left: '5%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '5%',
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,101,132,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'linear-gradient(135deg, #6c63ff, #ff6584)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <MessageSquare size={20} color="white" />
              </div>
              <span style={{ fontFamily: 'Clash Display', fontWeight: 700, fontSize: 24, color: 'var(--text-primary)' }}>
                Campus<span style={{ color: 'var(--primary)' }}>Voice</span>
              </span>
            </div>
          </Link>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 12 }}>
            Welcome back. Your voice matters.
          </p>
        </div>

        <div className="glass" style={{ padding: '36px 32px' }}>
          {/* Role toggle */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            background: 'var(--surface-2)', borderRadius: 12, padding: 4, marginBottom: 28,
          }}>
            {(['student', 'admin'] as const).map(r => (
              <button key={r} onClick={() => setRole(r)} style={{
                padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontFamily: 'Satoshi', fontWeight: 600, fontSize: 14,
                transition: 'all 0.3s',
                background: role === r ? 'var(--primary)' : 'transparent',
                color: role === r ? 'white' : 'var(--text-muted)',
              }}>
                {r === 'student' ? '🎓 Student' : '🛡️ Admin'}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: 16, padding: '12px 16px', borderRadius: 10,
              background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)',
              color: '#ff4757', fontSize: 13,
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  className="input-dark"
                  type="email"
                  placeholder="you@college.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ paddingLeft: 42 }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  className="input-dark"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingLeft: 42, paddingRight: 42 }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
                <button onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={handleLogin}
              disabled={loading}
              style={{
                width: '100%', fontSize: 15, padding: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <div style={{
                  width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white', borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </div>

          <div className="divider" />

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
            New to CampusVoice?{' '}
            <Link href="/signup" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Create an account
            </Link>
          </p>
        </div>

        <div style={{
          marginTop: 20, textAlign: 'center',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)' }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Your posts are always anonymous. We never reveal your identity.
          </span>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
