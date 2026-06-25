'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[dashboard] erreur de rendu', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf8f4] px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-12 h-12 rounded-full bg-[#f4e3e2] flex items-center justify-center text-[#9a3f3c] text-xl mx-auto mb-4">
          ⚠
        </div>
        <h1 className="font-semibold text-[20px] text-[#1a1a18] mb-2">
          Impossible de charger le dashboard
        </h1>
        <p className="text-[13.5px] text-[#a8a499] mb-1 leading-relaxed">
          {error?.message || 'Une erreur inattendue s\'est produite.'}
        </p>
        {error?.digest && (
          <p className="text-[11px] text-[#c8c3b8] mb-6 font-mono">
            Ref: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center flex-wrap mt-4">
          <button
            onClick={reset}
            className="bg-[#1a1a18] text-white font-semibold text-sm px-5 py-3 rounded-[10px] cursor-pointer border-none"
          >
            Réessayer
          </button>
          <Link
            href="/"
            className="border border-[#e6e2d9] text-[#56544e] font-semibold text-sm px-5 py-3 rounded-[10px] no-underline"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
