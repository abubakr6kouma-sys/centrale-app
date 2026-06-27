'use client'

import { useEffect, useRef, useState } from 'react'
import {
  EmailWithDraft,
  CATEGORY_STYLES,
  Category,
  initialsFromName,
  avatarColorFromString,
  formatRelativeTime,
} from '@/types/email'
import UsageStats from '@/components/dashboard/UsageStats'
import { Plan } from '@/lib/planTypes'
import EmailBodyRenderer from '@/components/dashboard/EmailBodyRenderer'

interface UsageData {
  plan: Plan
  emailsAnalyzedThisMonth: number
  emailsLimit: number | null
  prospectsDetected: number
  minutesSaved: number
}

interface EmailDetailProps {
  email: EmailWithDraft | null
  onSend: (emailId: string, finalContent: string) => Promise<void>
  onRegenerate: (emailId: string, intention?: string, instruction?: string) => Promise<void>
  /** Affiche le bouton "Retour à la liste" et le déclenche (mobile uniquement). */
  onBack?: () => void
  /** Statistiques d'usage affichées dans l'écran d'accueil (aucun email sélectionné). */
  usage?: UsageData | null
}

export default function EmailDetail({ email, onSend, onRegenerate, onBack, usage }: EmailDetailProps) {
  const [draftText, setDraftText] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  // "regenerating" = brouillon en cours de recréation (intention, personnalisation ou remplacement).
  const [regenerating, setRegenerating] = useState(false)
  // "autoGenerating" = première génération automatique à l'ouverture d'un email sans brouillon.
  const [autoGenerating, setAutoGenerating] = useState(false)
  // Mode personnalisation : affiche le champ de saisie libre.
  const [customizeMode, setCustomizeMode] = useState(false)
  const [customizeText, setCustomizeText] = useState('')

  // Empêche un résultat de génération automatique arrivé en retard d'écraser
  // l'écran si l'utilisateur a changé d'email entre-temps.
  const autoGenerationEmailId = useRef<string | null>(null)

  useEffect(() => {
    setSent(false)
    setDraftText(email?.draft?.ai_generated_content || '')
    setCustomizeMode(false)
    setCustomizeText('')
  }, [email?.id, email?.draft?.ai_generated_content])

  useEffect(() => {
    if (!email) return
    if (email.draft) return
    if (email.status === 'analyzing') return

    autoGenerationEmailId.current = email.id
    setAutoGenerating(true)

    onRegenerate(email.id).finally(() => {
      if (autoGenerationEmailId.current === email.id) {
        setAutoGenerating(false)
      }
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email?.id, email?.draft])

  if (!email) {
    return (
      <main className="flex-1 min-w-0 h-screen flex flex-col bg-cream max-md:hidden overflow-y-auto">
        {usage && (
          <UsageStats
            plan={usage.plan}
            emailsAnalyzedThisMonth={usage.emailsAnalyzedThisMonth}
            emailsLimit={usage.emailsLimit}
            prospectsDetected={usage.prospectsDetected}
            minutesSaved={usage.minutesSaved}
          />
        )}
        <div className="flex-1 flex items-center justify-center">
          <p className="text-faint text-sm">Sélectionnez un email pour voir le détail.</p>
        </div>
      </main>
    )
  }

  const style = CATEGORY_STYLES[(email.category as Category) || 'Autre']
  const initials = initialsFromName(email.sender_name, email.sender_email)
  const avatarBg = avatarColorFromString(email.sender_email)
  const alreadySent = !!email.draft?.sent_at

  async function handleSend() {
    if (!draftText.trim() || sending || alreadySent) return
    setSending(true)
    try {
      await onSend(email!.id, draftText)
      setSent(true)
    } finally {
      setSending(false)
    }
  }

  async function handleIntention(intention: string) {
    setRegenerating(true)
    try {
      await onRegenerate(email!.id, intention)
    } finally {
      setRegenerating(false)
    }
  }

  async function handleCustomize() {
    const text = customizeText.trim()
    if (!text) return
    setCustomizeMode(false)
    setCustomizeText('')
    setRegenerating(true)
    try {
      await onRegenerate(email!.id, undefined, text)
    } finally {
      setRegenerating(false)
    }
  }

  const isReady = sent || alreadySent
  const isGeneratingDraft = autoGenerating || regenerating

  return (
    <main className="flex-1 min-w-0 h-screen overflow-y-auto bg-cream">
      {onBack && (
        <button
          onClick={onBack}
          className="hidden max-md:flex items-center gap-[7px] cursor-pointer text-[13px] font-semibold text-muted bg-transparent border-none px-[18px] pt-4"
        >
          <span className="text-[15px]">←</span> Retour à la liste
        </button>
      )}

      <div className="max-w-[880px] mx-auto px-12 pt-10 pb-[88px] max-lg:px-[30px] max-lg:pt-[30px] max-lg:pb-[72px] max-md:px-[18px] max-md:pt-[18px] max-md:pb-16">

        <div className="flex items-start gap-[18px] mb-[34px]">
          <div
            className="w-12 h-12 flex-none rounded-full flex items-center justify-center text-white font-bold text-base"
            style={{ background: avatarBg }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-2xl font-semibold tracking-[-0.015em] m-0 mb-3 leading-[1.3] [text-wrap:pretty] text-ink">
              {email.subject || '(sans objet)'}
            </h2>
            <div className="flex items-center gap-x-[14px] gap-y-[10px] flex-wrap">
              <span className="text-sm font-semibold flex-none">{email.sender_name || email.sender_email}</span>
              <span className="text-[13px] text-faint break-all min-w-0">{email.sender_email}</span>
              <span className="text-[12.5px] text-faint flex-none">
                il y a {formatRelativeTime(email.received_at)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-[#ebe7dd] shadow-[0_1px_3px_rgba(60,50,30,0.05)] overflow-hidden mb-6">
          <div className="flex items-center gap-[9px] px-6 py-[15px] border-b border-linelight bg-[#fcfbf7]">
            <div className="w-[22px] h-[22px] rounded-[7px] bg-[#0a0a0a] flex items-center justify-center flex-none">
              <div className="w-1.5 h-1.5 rounded-full bg-[#c9b896] animate-pulse2" />
            </div>
            <span className="text-[13px] font-semibold text-[#2a2a26]">Analyse CentralY</span>
            <span className="ml-auto text-[11.5px] text-faint flex-none">
              {email.summary ? 'traité' : 'en cours d\'analyse...'}
            </span>
          </div>

          <div className="p-6">
            <div className="flex flex-wrap gap-x-[30px] gap-y-[22px] mb-6">
              <div className="flex-1 basis-[200px] min-w-0">
                <div className="text-[11px] font-semibold text-faint tracking-[0.06em] mb-[10px]">
                  CLASSIFICATION
                </div>
                <div
                  className="inline-flex items-center gap-2 text-[13.5px] font-semibold px-[14px] py-[7px] rounded-[9px] max-w-full"
                  style={{ color: style.text, background: style.bg }}
                >
                  <span className="w-[7px] h-[7px] rounded-[2px] flex-none" style={{ background: style.dot }} />
                  <span className="truncate">
                    {style.label}
                    {email.priority ? ` · Priorité ${email.priority}` : ''}
                  </span>
                </div>
              </div>
              <div className="flex-1 basis-[200px] min-w-0">
                <div className="text-[11px] font-semibold text-faint tracking-[0.06em] mb-[10px]">
                  STATUT
                </div>
                <div className="inline-flex items-center gap-2 text-[13.5px] font-semibold px-[14px] py-[7px] rounded-[9px] text-[#8a7343] bg-[#f3ecdf] max-w-full">
                  <span
                    className="w-[7px] h-[7px] rounded-full flex-none"
                    style={{ background: isReady ? '#7d8471' : '#bf9a4e' }}
                  />
                  <span className="truncate">{isReady ? 'Envoyé' : 'En attente de validation'}</span>
                </div>
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-faint tracking-[0.06em] mb-[10px]">
                RÉSUMÉ IA
              </div>
              <p className="text-[14.5px] text-[#3a3a36] leading-[1.65] m-0 [text-wrap:pretty]">
                {email.summary || 'Résumé en cours de génération…'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-[#f6f3ec] border border-[#ebe7dd] px-[22px] py-[18px] mb-6">
          <div className="text-[11px] font-semibold text-faint tracking-[0.06em] mb-2">
            EMAIL ORIGINAL
          </div>
          <EmailBodyRenderer content={email.body_full || email.body_preview || 'Contenu indisponible.'} />
        </div>

        <div className="rounded-2xl bg-white border border-[#ebe7dd] shadow-[0_1px_3px_rgba(60,50,30,0.05)] overflow-hidden">
          <div className="flex items-center flex-wrap gap-[9px] px-6 py-[15px] border-b border-linelight">
            <span className="text-[13px] font-semibold flex-none">✎ Brouillon de réponse</span>
            <span className="text-[11.5px] font-semibold text-gold-text bg-gold-bg px-[9px] py-0.5 rounded-md flex-none whitespace-nowrap">
              Généré par l&apos;IA
            </span>
          </div>

          {/* Intention buttons — visible only when a draft exists and is not sent */}
          {!isReady && !isGeneratingDraft && email.draft && (
            <div className="px-6 py-[14px] border-b border-linelight bg-[#faf9f5]">
              {customizeMode ? (
                <div className="flex items-center gap-[8px]">
                  <input
                    autoFocus
                    value={customizeText}
                    onChange={(e) => setCustomizeText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && customizeText.trim()) handleCustomize() }}
                    placeholder="Ex : Refuse plus poliment, sois plus direct…"
                    className="flex-1 min-w-0 text-[13.5px] text-ink bg-[#f6f3ec] border border-[#ddd6c9] rounded-[9px] px-[14px] py-[8px] outline-none focus:border-[#c9b896] placeholder:text-faint"
                  />
                  <button
                    onClick={handleCustomize}
                    disabled={!customizeText.trim()}
                    className="text-[13px] font-semibold text-cream bg-[#0a0a0a] border-none px-[14px] py-[8px] rounded-[9px] cursor-pointer disabled:opacity-40 whitespace-nowrap"
                  >
                    Appliquer
                  </button>
                  <button
                    onClick={() => { setCustomizeMode(false); setCustomizeText('') }}
                    className="text-[13px] text-muted bg-transparent border border-[#ddd6c9] px-[10px] py-[8px] rounded-[9px] cursor-pointer leading-none"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-[8px]">
                  {(
                    [
                      { id: 'accept', label: '✅ Accepter' },
                      { id: 'refuse', label: '❌ Refuser' },
                      { id: 'clarify', label: '❓ Précisions' },
                    ] as const
                  ).map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => handleIntention(id)}
                      className="text-[12.5px] font-semibold px-[12px] py-[7px] rounded-[8px] border border-[#ddd6c9] bg-white text-ink cursor-pointer whitespace-nowrap hover:bg-[#f6f3ec] transition-colors"
                    >
                      {label}
                    </button>
                  ))}
                  <button
                    onClick={() => setCustomizeMode(true)}
                    className="text-[12.5px] font-semibold px-[12px] py-[7px] rounded-[8px] border border-[#ddd6c9] bg-white text-ink cursor-pointer whitespace-nowrap hover:bg-[#f6f3ec] transition-colors"
                  >
                    ✍️ Personnaliser
                  </button>
                </div>
              )}
            </div>
          )}

          {isGeneratingDraft ? (
            <div className="px-6 py-10 flex flex-col items-center justify-center gap-3 text-center">
              <span
                className="w-5 h-5 rounded-full border-2 border-line border-t-[#b08968] animate-spin flex-none"
                aria-hidden="true"
              />
              <p className="text-[13.5px] text-muted m-0">
                Génération du brouillon par l&apos;IA…
              </p>
            </div>
          ) : (
            <textarea
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              disabled={isReady}
              rows={8}
              className="w-full p-6 text-[14.5px] text-[#2a2a26] leading-[1.75] outline-none border-none resize-none disabled:opacity-70 disabled:bg-white"
              placeholder={email.draft ? '' : 'Le brouillon apparaîtra ici une fois généré.'}
            />
          )}

          <div className="flex items-center flex-wrap gap-[14px] px-6 py-[18px] border-t border-linelight bg-[#fcfbf7]">
            <div className="flex items-center gap-[7px] text-[12.5px] text-faint flex-none">
              <span
                className="w-[7px] h-[7px] rounded-full flex-none"
                style={{ background: isReady ? '#7d8471' : '#bf9a4e' }}
              />
              {isReady
                ? 'Envoyé avec succès'
                : autoGenerating
                  ? 'Génération en cours…'
                  : 'Ton professionnel · prêt à envoyer'}
            </div>
            <div className="ml-auto flex gap-[10px] flex-wrap">
              <button
                disabled={isReady || isGeneratingDraft}
                className="border border-[#ddd6c9] bg-white cursor-pointer text-[13.5px] font-semibold text-muted px-[18px] py-[11px] rounded-[10px] disabled:opacity-50 whitespace-nowrap"
              >
                Modifier
              </button>
              <button
                onClick={handleSend}
                disabled={sending || isReady || isGeneratingDraft || !draftText.trim()}
                className="border-none cursor-pointer text-sm font-semibold text-cream px-[22px] py-[11px] rounded-[10px] inline-flex items-center gap-2 shadow-[0_6px_18px_rgba(10,10,10,0.22)] disabled:opacity-70 whitespace-nowrap"
                style={{ background: isReady ? '#5f6b4f' : '#0a0a0a' }}
              >
                <span>{sending ? 'Envoi…' : isReady ? 'Envoyé' : 'Valider & envoyer'}</span>
                {!isReady && !sending && <span>→</span>}
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-[12.5px] text-[#b5b0a3] mt-7">
          CentralY n&apos;envoie jamais sans votre validation.
        </p>
      </div>
    </main>
  )
}
