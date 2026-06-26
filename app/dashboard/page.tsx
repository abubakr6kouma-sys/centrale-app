'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Sidebar from '@/components/dashboard/Sidebar'
import EmailList from '@/components/dashboard/EmailList'
import EmailDetail from '@/components/dashboard/EmailDetail'
import QuotaModal from '@/components/dashboard/QuotaModal'
import { EmailWithDraft, Category, CATEGORY_STYLES } from '@/types/email'
import { Plan } from '@/lib/planTypes'

interface UsageData {
  plan: Plan
  emailsAnalyzedThisMonth: number
  emailsLimit: number | null
  prospectsDetected: number
  minutesSaved: number
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [emails, setEmails] = useState<EmailWithDraft[]>([])
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // 'all' = tous les emails (filtre par défaut du nouveau design), sinon une
  // valeur de Category ('Prospect', 'Client', ...).
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [quotaModalOpen, setQuotaModalOpen] = useState(false)
  // Pilote la bascule liste/détail en vue mobile (≤767px), comme dans le
  // nouveau design (classe .show-detail de la maquette d'origine).
  const [mobileShowDetail, setMobileShowDetail] = useState(false)

  const loadEmails = useCallback(async () => {
    try {
      const res = await fetch('/api/emails')
      const data: { ok: boolean; emails?: EmailWithDraft[] } = await res.json()
      if (data.ok && data.emails) {
        setEmails(data.emails)
      }
    } catch (err) {
      console.error('[dashboard] loadEmails failed', err)
    }
  }, [])

  const loadUsage = useCallback(async () => {
    try {
      const res = await fetch('/api/usage')
      const data: { ok: boolean } & Partial<UsageData> = await res.json()
      if (data.ok) {
        setUsage({
          plan: data.plan || 'free',
          emailsAnalyzedThisMonth: data.emailsAnalyzedThisMonth || 0,
          emailsLimit: data.emailsLimit ?? null,
          prospectsDetected: data.prospectsDetected || 0,
          minutesSaved: data.minutesSaved || 0,
        })
      }
    } catch (err) {
      console.error('[dashboard] loadUsage failed', err)
    }
  }, [])

  // Synchronise avec Gmail (classification, résumé, brouillon IA pour les
  // nouveaux emails). Déclenchée automatiquement au chargement du dashboard
  // ET par le bouton "Rafraîchir" — un seul chemin de code pour les deux,
  // l'indicateur de chargement reste visible dans les deux cas plutôt que de
  // masquer une vraie activité réseau/IA à l'utilisateur.
  const syncWithGmail = useCallback(async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/emails/sync', { method: 'POST' })
      if (res.status === 403) {
        setQuotaModalOpen(true)
        return
      }
      const data = await res.json().catch(() => null)
      if (data?.quotaExceeded) {
        setQuotaModalOpen(true)
      }
      await loadEmails()
      await loadUsage()
    } catch (err) {
      // Une synchronisation automatique qui échoue (réseau, Gmail
      // indisponible...) ne doit jamais casser le dashboard : les emails déjà
      // connus restent affichés, l'utilisateur peut retenter via le bouton
      // "Rafraîchir" visible dans EmailList.
      console.error('[dashboard] échec de la synchronisation Gmail', err)
    } finally {
      setRefreshing(false)
    }
  }, [loadEmails, loadUsage])

  // Empêche un double déclenchement de la synchro automatique si ce
  // composant est remonté plusieurs fois rapidement (ex: navigation
  // aller-retour entre /dashboard et /dashboard/settings) — une seule
  // synchro automatique par montage réel du dashboard.
  const autoSyncTriggeredRef = useRef(false)

  useEffect(() => {
    setLoading(true)
    // 1. Affichage immédiat des emails déjà connus, sans attendre Gmail —
    // l'utilisateur voit sa boîte tout de suite.
    Promise.all([loadEmails(), loadUsage()])
      .catch((err) => console.error('[dashboard] initial load failed', err))
      .finally(() => {
        setLoading(false)
        // 2. Synchronisation Gmail automatique en arrière-plan, sans clic :
        // nouveaux emails classés, résumés et brouillons générés tout seuls.
        if (!autoSyncTriggeredRef.current) {
          autoSyncTriggeredRef.current = true
          syncWithGmail()
        }
      })
  }, [loadEmails, loadUsage, syncWithGmail])

  async function handleRefresh() {
    await syncWithGmail()
  }

  async function handleSend(emailId: string, finalContent: string) {
    const res = await fetch(`/api/emails/${emailId}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: finalContent }),
    })
    const data = await res.json()
    if (data.ok) {
      await loadEmails()
    } else {
      throw new Error(data.error || 'send_failed')
    }
  }

  async function handleRegenerate(emailId: string, intention?: string, instruction?: string) {
    const payload: Record<string, string> = {}
    if (intention) payload.intention = intention
    if (instruction) payload.instruction = instruction

    const res = await fetch(`/api/emails/${emailId}/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.status === 403) {
      setQuotaModalOpen(true)
      return
    }
    const data = await res.json()
    if (data.ok) {
      await loadEmails()
      await loadUsage()
    }
  }

  const filteredEmails =
    activeFilter === 'all' ? emails : emails.filter((e) => e.category === activeFilter)

  const selectedEmail = emails.find((e) => e.id === selectedId) || null

  const counts: Record<string, number> = {
    Prospect: emails.filter((e) => e.category === 'Prospect').length,
    Client: emails.filter((e) => e.category === 'Client').length,
    Support: emails.filter((e) => e.category === 'Support').length,
    Facture: emails.filter((e) => e.category === 'Facture').length,
    Urgent: emails.filter((e) => e.category === 'Urgent').length,
    Autre: emails.filter((e) => e.category === 'Autre').length,
  }
  const pendingCount = emails.filter((e) => e.status === 'draft_ready').length

  const activeFilterLabel =
    activeFilter === 'all' ? 'Tous les emails' : CATEGORY_STYLES[activeFilter as Category]?.label || 'Tous les emails'

  function handleSelectEmail(email: EmailWithDraft) {
    setSelectedId(email.id)
    setMobileShowDetail(true)
  }

  function handleFilterChange(filter: string | null) {
    setActiveFilter(filter || 'all')
    setSelectedId(null)
    setMobileShowDetail(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="text-faint text-sm">Chargement de votre boîte…</p>
      </div>
    )
  }

  return (
    <div className="font-sans bg-cream text-ink min-h-screen flex max-lg:flex-col max-lg:h-screen max-lg:overflow-hidden">
      <Sidebar
        userName={session?.user?.name || 'Mon compte'}
        userEmail={session?.user?.email || ''}
        counts={counts}
        totalCount={emails.length}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />

      <div className="flex-1 flex min-w-0 max-md:flex-1 max-md:min-h-0">
        <div className={`max-md:w-full max-md:flex ${mobileShowDetail ? 'max-md:hidden' : ''}`}>
          <EmailList
            emails={filteredEmails}
            selectedId={selectedEmail?.id || null}
            onSelect={handleSelectEmail}
            onRefresh={handleRefresh}
            refreshing={refreshing}
            pendingCount={pendingCount}
            activeFilterLabel={activeFilterLabel}
          />
        </div>

        <div className={`flex-1 min-w-0 ${mobileShowDetail ? 'max-md:flex max-md:w-full' : 'max-md:hidden'}`}>
          <EmailDetail
            email={selectedEmail}
            onSend={handleSend}
            onRegenerate={handleRegenerate}
            onBack={() => setMobileShowDetail(false)}
            usage={usage}
          />
        </div>
      </div>

      <QuotaModal open={quotaModalOpen} onClose={() => setQuotaModalOpen(false)} plan={usage?.plan} />
    </div>
  )
}
