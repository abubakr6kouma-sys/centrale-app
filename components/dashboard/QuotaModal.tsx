'use client'

import Link from 'next/link'
import { Plan, PLAN_LABELS } from '@/lib/quota'

interface QuotaModalProps {
  open: boolean
  onClose: () => void
  /** Plan actuel de l'utilisateur, pour personnaliser le message (ex: "Gratuit", "Pro"). */
  plan?: Plan
}

// Modale affichée quand une route API renvoie quota_exceeded (403). Texte et
// boutons exacts demandés : pas de coordonnées personnelles, seulement les
// deux actions (passer au plan Pro, voir les abonnements). Le nom du plan
// est injecté dynamiquement plutôt que codé en dur, pour rester correct même
// pour un utilisateur Pro qui atteindrait sa propre limite (plus élevée).
export default function QuotaModal({ open, onClose, plan = 'free' }: QuotaModalProps) {
  if (!open) return null

  const planLabel = PLAN_LABELS[plan]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quota-modal-title"
    >
      <div className="bg-white rounded-2xl border border-[#ebe7dd] shadow-[0_30px_80px_rgba(0,0,0,0.25)] max-w-[440px] w-full p-7">
        <div className="w-11 h-11 rounded-full bg-[#f4e3e2] flex items-center justify-center text-[#9a3f3c] text-xl mb-4">
          ⚠
        </div>
        <h2 id="quota-modal-title" className="font-display text-[20px] font-semibold text-ink mb-2">
          Limite atteinte
        </h2>
        <p className="text-[14.5px] text-muted leading-relaxed mb-6">
          Vous avez atteint la limite de votre abonnement {planLabel}.
        </p>
        <div className="flex flex-col gap-[10px]">
          <Link
            href="/tarifs"
            className="text-center text-[14px] font-semibold text-cream bg-ink px-5 py-[12px] rounded-[10px] no-underline"
          >
            Passer au plan Pro
          </Link>
          <Link
            href="/tarifs"
            className="text-center text-[14px] font-semibold text-muted border border-line px-5 py-[12px] rounded-[10px] no-underline"
          >
            Voir les abonnements
          </Link>
          <button
            onClick={onClose}
            className="text-center text-[13px] text-faint bg-transparent border-none cursor-pointer py-1 mt-1"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}
