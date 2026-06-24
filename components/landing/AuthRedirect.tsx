'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

// Reproduit le comportement de l'ancien écran Entry : un utilisateur déjà
// connecté qui revient sur la landing (/) est redirigé automatiquement vers
// /dashboard, sans avoir à re-cliquer sur "Essayer gratuitement". Composant
// minimal et invisible, isolé ici pour que la page Landing elle-même reste
// un composant serveur.
export default function AuthRedirect() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard')
    }
  }, [status, router])

  return null
}
