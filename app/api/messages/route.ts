import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const [{ data: messages, error }, { data: likes }] = await Promise.all([
    supabase.from('messages').select('*').order('created_at', { ascending: true }),
    supabase.from('likes').select('message_id'),
  ])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const likeCounts: Record<number, number> = {}
  for (const like of likes ?? []) {
    likeCounts[like.message_id] = (likeCounts[like.message_id] ?? 0) + 1
  }

  const result = (messages ?? []).map((m) => ({
    ...m,
    like_count: likeCounts[m.id] ?? 0,
  }))

  return NextResponse.json(result)
}

export async function POST(request: Request) {
  const { content, author } = await request.json()

  if (!content?.trim()) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('messages')
    .insert([{ content: content.trim(), author: author?.trim() || 'Névtelen' }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ...data, like_count: 0 }, { status: 201 })
}
