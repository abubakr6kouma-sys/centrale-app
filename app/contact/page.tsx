'use client'

import { useState, FormEvent } from 'react'
import LandingNav from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooterCta'
import ScrollReveal from '@/components/landing/ScrollReveal'
import { SUPPORT_EMAIL } from '@/lib/siteConfig'

const USE_CASES = [
  { icon: '💬', label: 'Support produit', desc: 'Un bug, une fonctionnalité qui ne répond pas, une question sur l\'utilisation.' },
  { icon: '🔐', label: 'Confidentialité', desc: 'Demande d\'accès, de rectification ou de suppression de vos données.' },
  { icon: '💳', label: 'Abonnement', desc: 'Facturation, changement de plan, résiliation ou remboursement.' },
  { icon: '✉️', label: 'Autre question', desc: 'Partenariat, presse, ou toute autre question générale.' },
]

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) return
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      })
      const data = await res.json()
      setStatus(data.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="font-sans bg-[#0a0a0a] text-[#f5f3ee] min-h-screen overflow-hidden relative">
      <ScrollReveal />

      <div
        className="absolute -top-[340px] left-1/2 -translate-x-1/2 w-[1100px] h-[760px] blur-[20px] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(closest-side, rgba(201,184,150,0.08), rgba(201,184,150,0) 70%)',
        }}
      />

      <LandingNav />

      <main className="relative z-10 max-w-[640px] mx-auto px-10 pt-[60px] pb-[140px] max-md:px-5 max-md:pt-[36px]">

        {/* Header */}
        <div data-reveal className="text-center mb-[48px]">
          <div className="text-[12px] tracking-[0.16em] text-[#c9b896] font-semibold mb-[16px]">
            SUPPORT
          </div>
          <h1 className="font-display font-semibold text-[44px] leading-[1.1] tracking-[-0.03em] text-[#f5f3ee] mb-5 max-md:text-[30px]">
            Une question ?<br />
            <span className="font-serif italic font-normal text-[#c9b896]">Écrivez-nous.</span>
          </h1>
          <p className="text-[15.5px] leading-[1.65] text-[#9b9890] max-w-[480px] mx-auto">
            Notre équipe répond à toutes vos demandes — support, confidentialité, abonnement ou
            toute autre question.
          </p>
        </div>

        {/* Use-case grid */}
        <div data-reveal className="grid grid-cols-2 gap-3 mb-[40px] max-sm:grid-cols-1">
          {USE_CASES.map(({ icon, label, desc }) => (
            <div
              key={label}
              className="rounded-xl border border-[rgba(245,243,238,0.08)] bg-[rgba(245,243,238,0.02)] px-[18px] py-[15px]"
            >
              <div className="flex items-center gap-[9px] mb-[6px]">
                <span className="text-[16px] leading-none">{icon}</span>
                <span className="text-[13px] font-semibold text-[#e7e5de]">{label}</span>
              </div>
              <p className="text-[12.5px] text-[#6a6862] leading-[1.55] m-0">{desc}</p>
            </div>
          ))}
        </div>

        {/* Direct email */}
        <div
          data-reveal
          className="flex items-center gap-[13px] mb-[36px] px-5 py-[14px] rounded-xl border border-[rgba(245,243,238,0.08)] bg-[rgba(245,243,238,0.02)]"
        >
          <span className="text-[#6a6862] text-[13px] flex-none">Ou écrivez directement à</span>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-[13.5px] font-semibold text-[#c9b896] no-underline truncate min-w-0"
          >
            {SUPPORT_EMAIL}
          </a>
        </div>

        {/* Form / Success */}
        {status === 'sent' ? (
          <div
            data-reveal
            className="rounded-2xl border border-[rgba(125,132,113,0.35)] bg-[rgba(125,132,113,0.06)] px-7 py-10 text-center"
          >
            <div className="w-11 h-11 mx-auto mb-4 rounded-full bg-[rgba(125,132,113,0.18)] flex items-center justify-center text-[#9bb08a] text-[18px] font-semibold">
              ✓
            </div>
            <p className="text-[15px] text-[#e7e5de] font-semibold mb-2">Message envoyé</p>
            <p className="text-[13.5px] text-[#9b9890] leading-relaxed m-0">
              Nous vous répondrons directement à l&apos;adresse que vous avez indiquée, généralement
              sous 24 h.
            </p>
          </div>
        ) : (
          <form
            data-reveal
            onSubmit={handleSubmit}
            className="rounded-2xl border border-[rgba(245,243,238,0.1)] bg-[rgba(245,243,238,0.02)] px-7 py-8 flex flex-col gap-4"
          >
            <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
              <Field label="Nom">
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent border border-[rgba(245,243,238,0.14)] rounded-[10px] px-4 py-[11px] text-[14px] text-[#f5f3ee] outline-none focus:border-[#c9b896] transition-colors placeholder:text-[#4a4845]"
                  placeholder="Votre nom"
                />
              </Field>
              <Field label="Email">
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border border-[rgba(245,243,238,0.14)] rounded-[10px] px-4 py-[11px] text-[14px] text-[#f5f3ee] outline-none focus:border-[#c9b896] transition-colors placeholder:text-[#4a4845]"
                  placeholder="vous@exemple.fr"
                />
              </Field>
            </div>

            <Field label="Sujet">
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-transparent border border-[rgba(245,243,238,0.14)] rounded-[10px] px-4 py-[11px] text-[14px] text-[#f5f3ee] outline-none focus:border-[#c9b896] transition-colors placeholder:text-[#4a4845]"
                placeholder="Support · Confidentialité · Abonnement…"
              />
            </Field>

            <Field label="Message">
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-transparent border border-[rgba(245,243,238,0.14)] rounded-[10px] px-4 py-[11px] text-[14px] text-[#f5f3ee] outline-none focus:border-[#c9b896] transition-colors resize-none placeholder:text-[#4a4845]"
                placeholder="Décrivez votre demande en détail…"
              />
            </Field>

            {status === 'error' && (
              <p className="text-[13px] text-[#e0938f] m-0">
                L&apos;envoi a échoué. Vérifiez votre connexion ou écrivez-nous directement à{' '}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">
                  {SUPPORT_EMAIL}
                </a>
                .
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="mt-1 text-[15px] font-semibold text-[#0a0a0a] bg-[#f5f3ee] px-6 py-[13px] rounded-full border-none cursor-pointer disabled:opacity-60 transition-opacity"
            >
              {status === 'sending' ? 'Envoi…' : 'Envoyer le message'}
            </button>
          </form>
        )}
      </main>

      <LandingFooter />
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-[7px]">
      <span className="text-[11.5px] font-semibold text-[#6a6862] tracking-[0.04em] uppercase">
        {label}
      </span>
      {children}
    </label>
  )
}
