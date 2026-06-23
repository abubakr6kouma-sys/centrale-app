'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Sidebar from '@/components/dashboard/Sidebar'
import EmailList from '@/components/dashboard/EmailList'
import EmailDetail from '@/components/dashboard/EmailDetail'
import { EmailWithDraft, Category, CATEGORY_STYLES } from '@/types/email'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [emails, setEmails] = useState<EmailWithDraft[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // 'all' = tous les emails (filtre par défaut du nouveau design), sinon une
  // valeur de Category ('Prospect', 'Client', ...).
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  // Pilote la bascule liste/détail en vue mobile (≤767px), comme dans le
  // nouveau design (classe .show-detail de la maquette d'origine).
  const [mobileShowDetail, setMobileShowDetail] = useState(false)

  const loadEmails = useCallback(async () => {
    const res = await fetch('/api/emails')
    const data: { ok: boolean; emails?: EmailWithDraft[] } = await res.json()
    if (data.ok && data.emails) {
      setEmails(data.emails)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    loadEmails().finally(() => setLoading(false))
  }, [loadEmails])

  async function handleRefresh() {
    setRefreshing(true)
    try {
      await fetch('/api/emails/sync', { method: 'POST' })
      await loadEmails()
    } finally {
      setRefreshing(false)
    }
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

  async function handleRegenerate(emailId: string) {
    const res = await fetch(`/api/emails/${emailId}/draft`, { method: 'POST' })
    const data = await res.json()
    if (data.ok) {
      await loadEmails()
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
          />
        </div>
      </div>
    </div>
  )
}
