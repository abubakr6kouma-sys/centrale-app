'use client'

import { useEffect, useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { PLANS } from '@/lib/plans'
import { PaymentMethod, PAYMENT_METHOD_LABELS } from '@/lib/payments/types'

interface PricingCardsProps {
  /** 'dark' = fond noir (landing), 'light' = fond clair (page Tarifs dédiée). */
  variant?: 'dark' | 'light'
}

// Grille des 3 plans, réutilisée par la Landing et par /tarifs. Les boutons
// de paiement (Pro / Business) interrogent /api/payment-methods pour savoir
// si PayPal et/ou la carte bancaire sont déjà configurés (voir
// lib/payments/) ; tant que ce n'est pas le cas, ils restent désactivés
// avec la mention "Bientôt disponible" — sans qu'aucune clé ni identifiant
// ne transite jamais côté client. Le jour où un fournisseur est branché, ce
// composant active automatiquement son bouton, sans modification ici.
export default function PricingCards({ variant = 'dark' }: PricingCardsProps) {
  const isDark = variant === 'dark'
  const { status } = useSession()
  const router = useRouter()
  const [configuredMethods, setConfiguredMethods] = useState<PaymentMethod[]>([])

  useEffect(() => {
    fetch('/api/payment-methods')
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setConfiguredMethods(data.methods)
      })
      .catch(() => {
        // Si l'appel échoue, on reste sur la liste vide : tous les boutons
        // de paiement restent désactivés par défaut, jamais activés par erreur.
      })
  }, [])

  const hasAnyMethodConfigured = configuredMethods.length > 0

  return (
    <div data-reveal className="grid grid-cols-3 gap-5 items-stretch max-md:grid-cols-1 max-w-[1080px] mx-auto">
      {PLANS.map((plan) => {
        const highlightedStyle = plan.highlighted
          ? isDark
            ? {
                background: 'linear-gradient(180deg, rgba(201,184,150,0.1), rgba(201,184,150,0.02))',
                border: '1px solid rgba(201,184,150,0.4)',
                boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
              }
            : { background: '#fff', border: '1px solid #c9b896', boxShadow: '0 20px 60px rgba(176,137,104,0.18)' }
          : isDark
            ? { background: 'rgba(245,243,238,0.02)', border: '1px solid rgba(245,243,238,0.1)' }
            : { background: '#fff', border: '1px solid #ebe7dd' }

        const textPrimary = isDark ? '#f5f3ee' : '#1a1a18'
        const textSecondary = isDark ? '#9b9890' : '#6b7178'
        const textFeature = isDark ? '#c6c4bd' : '#3a3a36'

        return (
          <div
            key={plan.id}
            className="relative flex flex-col rounded-[18px] px-[26px] py-[30px]"
            style={highlightedStyle}
          >
            {plan.highlighted && (
              <div className="absolute -top-[11px] left-1/2 -translate-x-1/2 text-[11px] font-bold tracking-[0.08em] text-[#0a0a0a] bg-[#c9b896] px-3 py-1 rounded-full whitespace-nowrap">
                RECOMMANDÉ
              </div>
            )}
            <div className="font-display font-semibold text-[19px] mb-1.5" style={{ color: textPrimary }}>
              {plan.name}
            </div>
            <div className="text-[13.5px] mb-[22px]" style={{ color: textSecondary }}>
              {plan.tagline}
            </div>
            <div className="flex items-baseline gap-[6px]">
              <span
                className="font-display text-[32px] font-semibold tracking-[-0.02em]"
                style={{ color: textPrimary }}
              >
                {plan.priceLabel}
              </span>
              <span className="text-[13px]" style={{ color: textSecondary }}>
                {plan.priceSubLabel}
              </span>
            </div>

            <div
              className="h-px my-6"
              style={{ background: isDark ? 'rgba(245,243,238,0.08)' : '#ebe7dd' }}
            />

            <div className="flex flex-col gap-[13px] text-sm flex-1" style={{ color: textFeature }}>
              {plan.features.map((f) => (
                <div key={f} className="flex gap-[10px]">
                  <span className="text-[#b08968] flex-none">✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>

            {plan.id === 'free' ? (
              <button
                onClick={() => status === 'authenticated' ? router.push('/dashboard') : signIn('google', { callbackUrl: '/dashboard' })}
                className="mt-7 text-center text-[14.5px] font-semibold rounded-[11px] py-3 cursor-pointer border-none"
                style={
                  plan.highlighted
                    ? { color: '#0a0a0a', background: '#f5f3ee' }
                    : isDark
                      ? { color: '#e7e5de', background: 'transparent', border: '1px solid rgba(245,243,238,0.16)' }
                      : { color: '#1a1a18', background: 'transparent', border: '1px solid #ddd6c9' }
                }
              >
                {plan.cta}
              </button>
            ) : (
              <div className="mt-7 flex flex-col gap-2">
                <button
                  disabled={!hasAnyMethodConfigured}
                  title={
                    hasAnyMethodConfigured
                      ? undefined
                      : "Le paiement n'est pas encore activé pour ce plan"
                  }
                  className="text-center text-[14.5px] font-semibold rounded-[11px] py-3 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 border-none"
                  style={
                    plan.highlighted
                      ? { color: '#0a0a0a', background: '#f5f3ee' }
                      : isDark
                        ? { color: '#e7e5de', background: 'transparent', border: '1px solid rgba(245,243,238,0.16)' }
                        : { color: '#1a1a18', background: 'transparent', border: '1px solid #ddd6c9' }
                  }
                >
                  {plan.cta}
                  {!hasAnyMethodConfigured && ' — bientôt disponible'}
                </button>
                <p
                  className="text-[11.5px] text-center"
                  style={{ color: isDark ? '#6a6862' : '#a8a499' }}
                >
                  {hasAnyMethodConfigured
                    ? `Paiement par ${configuredMethods.map((m) => PAYMENT_METHOD_LABELS[m]).join(' ou ')}`
                    : 'Paiement par carte ou PayPal, à venir'}
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
