import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export interface CurrentUser {
  id: string
  email: string
  name: string | null
}

// Retourne null si personne n'est connecté, ou si la ligne Supabase
// correspondante n'existe pas (ne devrait pas arriver puisqu'elle est créée
// au moment du signIn, mais on reste défensif).
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, email, name')
    .eq('email', session.user.email)
    .maybeSingle()

  if (error || !data) return null
  return data
}
