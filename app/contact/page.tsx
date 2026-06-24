'use client'

import { useState, FormEvent } from 'react'
import LandingNav from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooterCta'

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
      <LandingNav />

      <section className="relative z-10 max-w-[560px] mx-auto px-10 pt-[70px] pb-[140px] max-md:px-5 max-md:pt-[40px]">
        <div className="text-center mb-10">
          <div className="text-[12.5px] tracking-[0.16em] text-[#c9b896] font-semibold mb-[18px]">
            SUPPORT
          </div>
          <h1 className="font-display font-semibold text-[40px] leading-[1.1] tracking-[-0.03em] text-[#f5f3ee] mb-4 max-md:text-[28px]">
            Une question ? Écrivez-nous.
          </h1>
          <p className="text-[16px] leading-[1.6] text-[#9b9890]">
            Notre équipe répond à toutes vos questions sur le produit, votre compte ou votre
            abonnement.
          </p>
        </div>

        {status === 'sent' ? (
          <div className="rounded-2xl border border-[rgba(125,132,113,0.35)] bg-[rgba(125,132,113,0.08)] px-7 py-8 text-center">
            <div className="w-11 h-11 mx-auto mb-4 rounded-full bg-[rgba(125,132,113,0.18)] flex items-center justify-center text-[#9bb08a] text-xl">
              ✓
            </div>
            <p className="text-[15px] text-[#e7e5de] font-semibold mb-1.5">Message envoyé</p>
            <p className="text-[13.5px] text-[#9b9890] leading-relaxed">
              Nous vous répondrons directement à l&apos;adresse que vous avez indiquée.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-[rgba(245,243,238,0.12)] bg-[rgba(245,243,238,0.02)] px-7 py-8 flex flex-col gap-4"
          >
            <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
              <Field label="Nom">
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent border border-[rgba(245,243,238,0.16)] rounded-[10px] px-4 py-[11px] text-[14px] text-[#f5f3ee] outline-none focus:border-[#c9b896]"
                  placeholder="Votre nom"
                />
              </Field>
              <Field label="Email">
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border border-[rgba(245,243,238,0.16)] rounded-[10px] px-4 py-[11px] text-[14px] text-[#f5f3ee] outline-none focus:border-[#c9b896]"
                  placeholder="vous@exemple.fr"
                />
              </Field>
            </div>

            <Field label="Sujet (optionnel)">
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-transparent border border-[rgba(245,243,238,0.16)] rounded-[10px] px-4 py-[11px] text-[14px] text-[#f5f3ee] outline-none focus:border-[#c9b896]"
                placeholder="Question sur mon abonnement"
              />
            </Field>

            <Field label="Message">
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-transparent border border-[rgba(245,243,238,0.16)] rounded-[10px] px-4 py-[11px] text-[14px] text-[#f5f3ee] outline-none focus:border-[#c9b896] resize-none"
                placeholder="Décrivez votre question..."
              />
            </Field>

            {status === 'error' && (
              <p className="text-[13px] text-[#e0938f]">
                L&apos;envoi a échoué. Vérifiez votre connexion et réessayez.
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="mt-2 text-[15px] font-semibold text-[#0a0a0a] bg-[#f5f3ee] px-6 py-[13px] rounded-full border-none cursor-pointer disabled:opacity-60"
            >
              {status === 'sending' ? 'Envoi…' : 'Envoyer le message'}
            </button>
          </form>
        )}
      </section>

      <LandingFooter />
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-[7px]">
      <span className="text-[12px] font-semibold text-[#9b9890] tracking-[0.02em]">{label}</span>
      {children}
    </label>
  )
}
