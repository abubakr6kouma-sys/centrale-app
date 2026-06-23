'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  EmailWithDraft,
  CATEGORY_STYLES,
  Category,
  initialsFromName,
  avatarColorFromString,
  formatRelativeTime,
} from '@/types/email'

interface EmailListProps {
  emails: EmailWithDraft[]
  selectedId: string | null
  onSelect: (email: EmailWithDraft) => void
  onRefresh: () => void
  refreshing: boolean
  pendingCount: number
  /** Libellé du filtre actif, affiché sous le titre (ex: "Tous les emails", "Prospects"). */
  activeFilterLabel: string
}

export default function EmailList({
  emails,
  selectedId,
  onSelect,
  onRefresh,
  refreshing,
  pendingCount,
  activeFilterLabel,
}: EmailListProps) {
  const [query, setQuery] = useState('')

  const filtered = emails.filter((e) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return (
      (e.sender_name || '').toLowerCase().includes(q) ||
      (e.subject || '').toLowerCase().includes(q) ||
      (e.body_preview || '').toLowerCase().includes(q)
    )
  })

  return (
    <section
      className="
        w-[392px] flex-none border-r border-line bg-white flex flex-col h-screen sticky top-0 min-w-0
        max-lg:w-[316px]
        max-md:w-full max-md:flex-1 max-md:border-r-0 max-md:h-auto max-md:static
      "
    >
      <header className="px-[22px] pt-[18px] pb-[14px] border-b border-linelight max-md:px-[18px] max-md:pt-4 max-md:pb-3">
        <div className="flex items-start justify-between gap-3 mb-[14px]">
          <div className="min-w-0">
            <h1 className="font-display text-[19px] font-semibold m-0 text-ink">
              Boîte intelligente
            </h1>
            <div className="text-[12.5px] text-faint mt-0.5 truncate">
              {filtered.length} email{filtered.length === 1 ? '' : 's'} · {activeFilterLabel}
              {pendingCount > 0 && ` · ${pendingCount} à valider`}
            </div>
          </div>
          <div className="flex gap-1.5 flex-none">
            <button
              onClick={onRefresh}
              disabled={refreshing}
              aria-label="Rafraîchir"
              className="w-8 h-8 rounded-lg border border-line flex items-center justify-center text-muted cursor-pointer bg-white disabled:opacity-50 flex-none"
            >
              <span className={refreshing ? 'animate-spin inline-block' : ''}>⇅</span>
            </button>
            <Link
              href="/dashboard/settings"
              aria-label="Paramètres"
              className="w-8 h-8 rounded-lg border border-line flex items-center justify-center text-muted cursor-pointer flex-none no-underline"
            >
              ⚙
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-[9px] px-3 py-2 rounded-[9px] bg-[#f6f3ec] border border-line">
          <span className="text-faint text-sm flex-none">⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un email…"
            className="border-none outline-none bg-transparent text-[13.5px] text-ink w-full min-w-0"
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="p-6 text-center text-[13px] text-faint">
            {emails.length === 0
              ? 'Aucun email synchronisé pour le moment.'
              : 'Aucun résultat pour cette recherche.'}
          </div>
        )}

        {filtered.map((m) => {
          const style = CATEGORY_STYLES[(m.category as Category) || 'Autre']
          const initials = initialsFromName(m.sender_name, m.sender_email)
          const avatarBg = avatarColorFromString(m.sender_email)
          const needsValidation = m.status === 'draft_ready'
          const isSelected = selectedId === m.id

          return (
            <button
              key={m.id}
              onClick={() => onSelect(m)}
              className="w-full text-left cursor-pointer px-[22px] py-[15px] border-b border-linelight flex gap-[13px] max-md:px-[18px] max-md:py-[14px]"
              style={{ background: isSelected ? '#f4f1e9' : undefined }}
            >
              <div
                className="w-[38px] h-[38px] flex-none rounded-full flex items-center justify-center text-white font-bold text-[13px]"
                style={{ background: avatarBg }}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-[3px]">
                  <span className="font-semibold text-[13.5px] whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
                    {m.sender_name || m.sender_email}
                  </span>
                  <span className="ml-auto text-[11px] text-faint flex-none">
                    {formatRelativeTime(m.received_at)}
                  </span>
                </div>
                <div className="text-[13px] text-[#3a3a36] leading-[1.4] mb-[7px] overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:1] [-webkit-box-orient:vertical]">
                  {m.subject || '(sans objet)'}
                </div>
                <div className="flex items-center gap-[6px] flex-wrap">
                  <span
                    className="text-[11px] font-semibold px-[9px] py-[3px] rounded-md inline-flex items-center gap-[5px] max-w-full whitespace-nowrap"
                    style={{ color: style.text, background: style.bg }}
                  >
                    <span className="w-[6px] h-[6px] rounded-[2px] flex-none" style={{ background: style.dot }} />
                    {style.label}
                  </span>
                  {needsValidation && (
                    <span className="text-[11px] font-semibold text-gold-text bg-gold-bg px-[9px] py-[3px] rounded-md whitespace-nowrap">
                      À valider
                    </span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
