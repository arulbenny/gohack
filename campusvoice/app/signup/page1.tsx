'use client'


import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MessageSquare, Mail, Lock, User, Upload, ArrowRight, CheckCircle } from 'lucide-react'


const colleges = [
  'VIT Vellore', 'BITS Pilani', 'NIT Trichy', 'PSG Tech', 'Amrita Coimbatore',
  'SRM Chennai', 'Manipal Institute', 'Anna University', 'Other',
]


const steps = ['Account', 'College', 'Verify']


export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [role, setRole] = useState<'student' | 'admin'>('student')
  const [college, setCollege] = useState('')
  const [idUploaded, setIdUploaded] = useState(false)
  const [loading, setLoading] = useState(false)


  const handleNext = async () => {
    if (step < 2) {
      setStep(step + 1)
    } else {
      setLoading(true)
      await new Promise(r => setTimeout(r, 1500))
      router.push('/feed')
    }
  }


  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--background)', padding: '24px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '10%', right: '5%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />


      <div style={{ width: '100%', maxWidth: 460, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: 'linear-gradient(135deg, #6c63ff, #ff6584)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <MessageSquare size={18} color="white" />
              </div>
              <span style={{ fontFamily: 'Clash Display', fontWeight: 700, fontSize: 22, color: 'var(--text-primary)' }}>
                Campus<span style={{ color: 'var(--primary)' }}>Voice</span>
              </span>
            </div>
          </Link>
        </div>


        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 32 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: i <= step ? 'var(--primary)' : 'var(--surface-2)',
                  border: `2px solid ${i <= step ? 'var(--primary)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.3s',
                  fontSize: 13, fontWeight: 700,
                  color: i <= step ? 'white' : 'var(--text-muted)',
                }}>
                  {i < step ? <CheckCircle size={16} /> : i + 1}
                </div>
                <span style={{ fontSize: 11, color: i <= step ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600 }}>
                  {s}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  width: 60, height: 2, margin: '0 4px', marginBottom: 20,
                  background: i < step ? 'var(--primary)' : 'var(--border)',
                  transition: 'all 0.3s',
                }} />
              )}
            </div>
          ))}
        </div>


        {/* Card */}
        <div className="glass" style={{ padding: '36px 32px' }}>
          {step === 0 && (
            <div>
              <h2 style={{ fontFamily: 'Clash Display', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
                Create your account
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
                Choose your role to get started
              </p>


              {/* Role toggle */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                background: 'var(--surface-2)', borderRadius: 12, padding: 4, marginBottom: 24,
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


              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input className="input-dark" placeholder="Full Name" style={{ paddingLeft: 42 }} />
                </div>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input className="input-dark" type="email" placeholder="Email Address" style={{ paddingLeft: 42 }} />
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input className="input-dark" type="password" placeholder="Create Password" style={{ paddingLeft: 42 }} />
                </div>
              </div>
            </div>
          )}


          {step === 1 && (
            <div>
              <h2 style={{ fontFamily: 'Clash Display', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
                Select your college
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
                You'll only see issues from your college
              </p>


              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {colleges.map(c => (
                  <button key={c} onClick={() => setCollege(c)} style={{
                    padding: '14px 16px', borderRadius: 12, textAlign: 'left',
                    background: college === c ? 'rgba(108,99,255,0.12)' : 'var(--surface-2)',
                    border: `1px solid ${college === c ? 'var(--primary)' : 'var(--border)'}`,
                    color: college === c ? 'var(--primary)' : 'var(--text-secondary)',
                    fontFamily: 'Satoshi', fontWeight: 500, fontSize: 14, cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    {c}
                    {college === c && <CheckCircle size={16} />}
                  </button>
                ))}
              </div>
            </div>
          )}


          {step === 2 && (
            <div>
              <h2 style={{ fontFamily: 'Clash Display', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
                Verify your identity
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
                Upload your college ID card. Your admin will verify and approve your account.
              </p>


              <div
                onClick={() => setIdUploaded(true)}
                style={{
                  border: `2px dashed ${idUploaded ? 'var(--accent-green)' : 'var(--border)'}`,
                  borderRadius: 16, padding: '48px 24px', textAlign: 'center',
                  cursor: 'pointer', transition: 'all 0.3s',
                  background: idUploaded ? 'rgba(67,233,123,0.05)' : 'var(--surface-2)',
                }}
                onMouseEnter={e => {
                  if (!idUploaded) (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--primary)'
                }}
                onMouseLeave={e => {
                  if (!idUploaded) (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
                }}
              >
                {idUploaded ? (
                  <>
                    <CheckCircle size={40} color="var(--accent-green)" style={{ margin: '0 auto 12px' }} />
                    <p style={{ color: 'var(--accent-green)', fontWeight: 600, fontSize: 15 }}>ID Card Uploaded!</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>college_id.jpg</p>
                  </>
                ) : (
                  <>
                    <Upload size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                    <p style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: 15 }}>Click to upload ID card</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>JPG, PNG up to 5MB</p>
                  </>
                )}
              </div>


              <div style={{
                marginTop: 20, padding: '14px 16px', borderRadius: 12,
                background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)',
                fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6,
              }}>
                🔒 Your ID is only used to verify your college. It will never be shared or visible to other users.
              </div>
            </div>
          )}


          <button
            className="btn-primary"
            onClick={handleNext}
            disabled={loading || (step === 1 && !college)}
            style={{
              width: '100%', marginTop: 24, fontSize: 15, padding: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: (loading || (step === 1 && !college)) ? 0.6 : 1,
            }}
          >
            {loading ? (
              <div style={{
                width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)',
                borderTop: '2px solid white', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
            ) : (
              <>{step === 2 ? 'Submit & Wait for Approval' : 'Continue'} <ArrowRight size={16} /></>
            )}
          </button>
        </div>


        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)', marginTop: 20 }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>


      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

