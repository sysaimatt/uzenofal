'use client'

import { useEffect, useRef, useState } from 'react'
import type { Message } from '@/lib/supabase'
import { supabaseBrowser } from '@/lib/supabase-browser'

export default function Home() {
  const [username, setUsername] = useState<string | null>(null)
  const [usernameInput, setUsernameInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set())
  const bottomRef = useRef<HTMLDivElement>(null)

  // Felhasználónév betöltése localStorage-ból
  useEffect(() => {
    const stored = localStorage.getItem('uzenofal-username')
    if (stored) setUsername(stored)
    const storedLikes = localStorage.getItem('uzenofal-liked')
    if (storedLikes) {
      try { setLikedIds(new Set(JSON.parse(storedLikes))) } catch {}
    }
  }, [])

  async function fetchMessages() {
    const res = await fetch('/api/messages')
    if (res.ok) {
      const data = await res.json()
      setMessages(data)
    }
    setFetching(false)
  }

  // Első betöltés
  useEffect(() => {
    fetchMessages()
  }, [])

  // Görgetés az aljára új üzeneteknél
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  // Valós idejű frissítés Supabase Realtime-mal
  useEffect(() => {
    if (!supabaseBrowser) {
      // Fallback: polling 4 másodpercenként ha nincs realtime
      const interval = setInterval(fetchMessages, 4000)
      return () => clearInterval(interval)
    }

    const channel = supabaseBrowser
      .channel('uzenofal-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchMessages)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, fetchMessages)
      .subscribe()

    return () => { supabaseBrowser?.removeChannel(channel) }
  }, [])

  function saveUsername() {
    const name = usernameInput.trim()
    if (!name) return
    localStorage.setItem('uzenofal-username', name)
    setUsername(name)
  }

  async function handleSend() {
    if (!content.trim() || !username) return
    setSending(true)
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, author: username }),
    })
    setContent('')
    setSending(false)
    // Ha nincs realtime, manuálisan frissítünk
    if (!supabaseBrowser) await fetchMessages()
  }

  async function handleLike(id: number) {
    if (likedIds.has(id)) return
    await fetch(`/api/messages/${id}/like`, { method: 'POST' })
    const newLiked = new Set(likedIds).add(id)
    setLikedIds(newLiked)
    localStorage.setItem('uzenofal-liked', JSON.stringify([...newLiked]))
    setMessages(prev => prev.map(m => m.id === id ? { ...m, like_count: m.like_count + 1 } : m))
  }

  async function handleDelete(id: number) {
    await fetch(`/api/messages/${id}`, { method: 'DELETE' })
    setMessages(prev => prev.filter(m => m.id !== id))
  }

  const isOwn = (author: string) => author === username

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f5f6f8' }}>

      {/* Felhasználónév modal */}
      {!username && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(46,54,73,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
          backdropFilter: 'blur(2px)',
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: '40px 36px', width: '100%', maxWidth: 380,
            boxShadow: '0 8px 40px rgba(46,54,73,0.18)', textAlign: 'center',
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>👋</div>
            <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: '#2E3649' }}>
              Üdvözöljük!
            </h2>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: '#8a92a3' }}>
              Add meg a nevedet az üzenetek küldéséhez.
            </p>
            <input
              autoFocus
              type="text"
              placeholder="Pl. Kovács Péter"
              value={usernameInput}
              maxLength={30}
              onChange={e => setUsernameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveUsername()}
              style={{
                width: '100%', boxSizing: 'border-box', border: '1.5px solid #e0e3e8',
                borderRadius: 8, padding: '11px 14px', fontSize: 15, color: '#2E3649',
                outline: 'none', fontFamily: 'inherit', marginBottom: 14,
              }}
            />
            <button
              onClick={saveUsername}
              disabled={!usernameInput.trim()}
              style={{
                width: '100%', background: usernameInput.trim() ? '#ff6900' : '#f0a070',
                color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0',
                fontSize: 15, fontWeight: 600, cursor: usernameInput.trim() ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit',
              }}
            >
              Belépés
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{
        background: '#2E3649', padding: '0 20px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56,
      }}>
        <span style={{ fontWeight: 700, fontSize: 18, color: '#fff', letterSpacing: '-0.3px' }}>
          <span style={{ color: '#ff6900' }}>STRT</span> Üzenőfal
        </span>
        {username && (
          <span style={{
            fontSize: 13, color: '#a0a8b8', background: 'rgba(255,255,255,0.08)',
            padding: '4px 12px', borderRadius: 20,
          }}>
            {username}
          </span>
        )}
      </header>

      {/* Üzenetek */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {fetching ? (
            <p style={{ textAlign: 'center', color: '#a0a8b8', padding: '40px 0' }}>Betöltés...</p>
          ) : messages.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#a0a8b8', padding: '40px 0' }}>
              Még nincs üzenet. Légy az első!
            </p>
          ) : messages.map(msg => {
            const own = isOwn(msg.author)
            const liked = likedIds.has(msg.id)
            return (
              <div key={msg.id} style={{
                display: 'flex', flexDirection: 'column',
                alignItems: own ? 'flex-end' : 'flex-start',
              }}>
                {/* Név */}
                <span style={{
                  fontSize: 11, fontWeight: 600, color: '#8a92a3',
                  marginBottom: 4, marginLeft: own ? 0 : 4, marginRight: own ? 4 : 0,
                  letterSpacing: '0.04em', textTransform: 'uppercase',
                }}>
                  {own ? 'Te' : msg.author}
                </span>

                {/* Buborék */}
                <div style={{
                  maxWidth: '72%', background: own ? '#2E3649' : '#ffffff',
                  color: own ? '#ffffff' : '#2E3649',
                  borderRadius: own ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  padding: '12px 16px',
                  boxShadow: '0 2px 8px rgba(46,54,73,0.09)',
                  border: own ? 'none' : '1px solid #e8eaed',
                  fontSize: 15, lineHeight: 1.55, whiteSpace: 'pre-wrap',
                }}>
                  {msg.content}
                </div>

                {/* Like + idő + törlés */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  marginTop: 5, flexDirection: own ? 'row-reverse' : 'row',
                }}>
                  <span style={{ fontSize: 11, color: '#b0b8c8' }}>
                    {new Date(msg.created_at).toLocaleString('hu-HU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>

                  <button
                    onClick={() => handleLike(msg.id)}
                    title={liked ? 'Már like-oltad' : 'Like'}
                    style={{
                      background: 'none', border: 'none', cursor: liked ? 'default' : 'pointer',
                      padding: '2px 6px', borderRadius: 20, fontSize: 13,
                      display: 'flex', alignItems: 'center', gap: 4,
                      color: liked ? '#ff6900' : '#a0a8b8',
                      fontFamily: 'inherit', transition: 'color 0.15s',
                    }}
                  >
                    <span style={{ fontSize: 15 }}>{liked ? '❤️' : '🤍'}</span>
                    {msg.like_count > 0 && (
                      <span style={{ fontWeight: 600, fontSize: 12 }}>{msg.like_count}</span>
                    )}
                  </button>

                  {own && (
                    <button
                      onClick={() => handleDelete(msg.id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 11, color: '#c0c8d8', padding: '2px 4px',
                        fontFamily: 'inherit', transition: 'color 0.15s',
                      }}
                      onMouseEnter={e => (e.target as HTMLElement).style.color = '#cf2e2e'}
                      onMouseLeave={e => (e.target as HTMLElement).style.color = '#c0c8d8'}
                    >
                      Törlés
                    </button>
                  )}
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div style={{
        borderTop: '1px solid #e8eaed', background: '#ffffff', padding: '14px 16px',
        flexShrink: 0,
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', gap: 10 }}>
          <textarea
            rows={1}
            placeholder={username ? 'Írj egy üzenetet...' : 'Lépj be a küldéshez...'}
            value={content}
            disabled={!username}
            onChange={e => setContent(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
            }}
            style={{
              flex: 1, border: '1.5px solid #e0e3e8', borderRadius: 10,
              padding: '10px 14px', fontSize: 15, color: '#2E3649', background: '#f9fafb',
              resize: 'none', outline: 'none', fontFamily: 'inherit', lineHeight: 1.5,
            }}
            onFocus={e => e.target.style.borderColor = '#ff6900'}
            onBlur={e => e.target.style.borderColor = '#e0e3e8'}
          />
          <button
            onClick={handleSend}
            disabled={sending || !content.trim() || !username}
            style={{
              background: sending || !content.trim() || !username ? '#f0a070' : '#ff6900',
              color: '#fff', border: 'none', borderRadius: 10,
              padding: '0 22px', fontSize: 15, fontWeight: 600,
              cursor: sending || !content.trim() || !username ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', whiteSpace: 'nowrap',
            }}
          >
            {sending ? '...' : 'Küldés'}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #e8eaed', padding: '10px 16px', textAlign: 'center', background: '#fff' }}>
        <span style={{ fontSize: 12, color: '#c0c8d8' }}>
          © {new Date().getFullYear()} STRT Holding · Készítette:{' '}
          <a href="https://www.sysai.hu" target="_blank" rel="noopener noreferrer"
            style={{ color: '#ff6900', textDecoration: 'none', fontWeight: 500 }}>
            SysAI
          </a>
          {' '}– AI használatával
        </span>
      </div>
    </div>
  )
}
