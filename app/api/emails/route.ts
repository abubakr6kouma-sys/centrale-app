import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/currentUser'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: 'unauthenticated' }, { status: 401 })
  }

  const { data: emails, error } = await supabaseAdmin
    .from('emails')
    .select('*, drafts(*)')
    .eq('user_id', user.id)
    .order('received_at', { ascending: false })

  if (error) {
    console.error('[emails] échec de la lecture', error)
    return NextResponse.json({ ok: false, error: 'fetch_failed' }, { status: 500 })
  }

  // Supabase renvoie la relation imbriquée comme un tableau (drafts: [...])
  // même si elle est unique côté schéma (un draft par email) : on l'aplatit
  // ici pour que le front reçoive directement `draft: {...} | null`.
  const normalized = (emails || []).map((e: Record<string, any>) => ({
    ...e,
    draft: Array.isArray(e.drafts) ? e.drafts[0] || null : e.drafts || null,
    drafts: undefined,
  }))

  return NextResponse.json({ ok: true, emails: normalized })
}
