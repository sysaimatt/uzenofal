'use client'

import { useEffect, useState } from 'react'
import type { Message } from '@/lib/supabase'

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  async function fetchMessages() {
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

    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })

    if (res.ok) {
      setContent('')
      await fetchMessages()
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
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-8">
          Üzenőfal
        </h1>

        {/* Beviteli mező */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
            rows={3}
            placeholder="Írj egy üzenetet..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) handleSave()
            }}
          />
          <button
            onClick={handleSave}
            disabled={loading || !content.trim()}
            className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            {loading ? 'Mentés...' : 'Mentés'}
          </button>
        </div>

        {/* Üzenetek listája */}
        {fetching ? (
          <p className="text-center text-gray-400">Betöltés...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-400">Még nincs üzenet. Légy az első!</p>
        ) : (
          <ul className="space-y-3">
            {messages.map((msg) => (
              <li
                key={msg.id}
                className="bg-white rounded-xl shadow px-5 py-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <p className="text-gray-800 text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(msg.created_at).toLocaleString('hu-HU')}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(msg.id)}
                  className="text-red-400 hover:text-red-600 text-xs font-medium shrink-0 mt-0.5 transition-colors"
                  title="Törlés"
                >
                  Törlés
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
