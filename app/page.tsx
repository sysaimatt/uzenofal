'use client'

import { useEffect, useState } from 'react'
import type { Message } from '@/lib/supabase'

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchMessages() {
    setFetching(true)
    const res = await fetch('/api/messages')
    if (res.ok) {
      const data = await res.json()
      setMessages(data)
    }
    setFetching(false)
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  async function handleSave() {
    if (!content.trim()) return
    setLoading(true)
    setError(null)

    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })

    if (res.ok) {
      setContent('')
      await fetchMessages()
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Hiba történt a mentés során.')
    }
    setLoading(false)
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setMessages((prev) => prev.filter((m) => m.id !== id))
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6f8' }}>

      {/* Header */}
      <header style={{ background: '#2E3649', padding: '0 24px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', alignItems: 'center', height: 60 }}>
          <span style={{ color: '#ff6900', fontWeight: 700, fontSize: 22, letterSpacing: '-0.5px' }}>
            STRT
          </span>
          <span style={{ color: '#ffffff', fontWeight: 400, fontSize: 22, marginLeft: 2 }}>
            {' '}Üzenőfal
          </span>
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px' }}>

        {/* Beviteli kártya */}
        <div style={{
          background: '#ffffff',
          borderRadius: 12,
          padding: 28,
          marginBottom: 32,
          boxShadow: '0 2px 12px rgba(46,54,73,0.08)',
          border: '1px solid #e8eaed'
        }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: 14, color: '#2E3649', marginBottom: 10 }}>
            Új üzenet
          </label>
          <textarea
            rows={3}
            placeholder="Írj egy üzenetet..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleSave() }}
            style={{
              width: '100%',
              border: '1.5px solid #e0e3e8',
              borderRadius: 8,
              padding: '12px 14px',
              fontSize: 15,
              color: '#2E3649',
              background: '#f9fafb',
              resize: 'none',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = '#ff6900'}
            onBlur={e => e.target.style.borderColor = '#e0e3e8'}
          />
          {error && (
            <p style={{ color: '#cf2e2e', fontSize: 13, marginTop: 8 }}>{error}</p>
          )}
          <button
            onClick={handleSave}
            disabled={loading || !content.trim()}
            style={{
              marginTop: 14,
              width: '100%',
              background: loading || !content.trim() ? '#f0a070' : '#ff6900',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 0',
              fontSize: 15,
              fontWeight: 600,
              cursor: loading || !content.trim() ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              transition: 'background 0.15s',
              letterSpacing: '0.01em',
            }}
          >
            {loading ? 'Mentés...' : 'Mentés'}
          </button>
        </div>

        {/* Lista */}
        <div>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: '#8a92a3', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
            Üzenetek
          </h2>

          {fetching ? (
            <p style={{ color: '#8a92a3', textAlign: 'center', padding: '32px 0' }}>Betöltés...</p>
          ) : messages.length === 0 ? (
            <div style={{
              background: '#ffffff',
              borderRadius: 12,
              padding: '32px 24px',
              textAlign: 'center',
              color: '#8a92a3',
              fontSize: 15,
              border: '1px solid #e8eaed'
            }}>
              Még nincs üzenet. Légy az első!
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.map((msg) => (
                <li key={msg.id} style={{
                  background: '#ffffff',
                  borderRadius: 12,
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 16,
                  boxShadow: '0 1px 4px rgba(46,54,73,0.06)',
                  border: '1px solid #e8eaed',
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 15, color: '#2E3649', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {msg.content}
                    </p>
                    <p style={{ margin: '6px 0 0', fontSize: 12, color: '#a0a8b8' }}>
                      {new Date(msg.created_at).toLocaleString('hu-HU')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(msg.id)}
                    style={{
                      background: 'none',
                      border: '1px solid #e0e3e8',
                      borderRadius: 6,
                      padding: '4px 10px',
                      fontSize: 12,
                      color: '#8a92a3',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      whiteSpace: 'nowrap',
                      transition: 'color 0.15s, border-color 0.15s',
                    }}
                    onMouseEnter={e => { (e.target as HTMLButtonElement).style.color = '#cf2e2e'; (e.target as HTMLButtonElement).style.borderColor = '#cf2e2e' }}
                    onMouseLeave={e => { (e.target as HTMLButtonElement).style.color = '#8a92a3'; (e.target as HTMLButtonElement).style.borderColor = '#e0e3e8' }}
                  >
                    Törlés
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #e8eaed', padding: '20px 24px', textAlign: 'center', marginTop: 40 }}>
        <span style={{ fontSize: 13, color: '#a0a8b8' }}>
          © {new Date().getFullYear()} STRT Holding
        </span>
        <p style={{ margin: '6px 0 0', fontSize: 12, color: '#c0c8d8' }}>
          Készítette: SysAI – AI használatával –{' '}
          <a href="https://www.sysai.hu" target="_blank" rel="noopener noreferrer" style={{ color: '#ff6900', textDecoration: 'none' }}>
            www.sysai.hu
          </a>
        </p>
      </footer>
    </div>
  )
}
