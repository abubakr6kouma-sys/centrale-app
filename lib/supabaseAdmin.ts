import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.warn(
    '[supabase] NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant. ' +
      'Les routes API qui dépendent de Supabase échoueront tant que ces variables ne sont pas définies.'
  )
}

// Client côté serveur uniquement (clé service_role : ne jamais exposer au navigateur,
// ne jamais importer ce fichier depuis un composant client).
export const supabaseAdmin = createClient(supabaseUrl || '', serviceRoleKey || '', {
  auth: { persistSession: false, autoRefreshToken: false },
})
