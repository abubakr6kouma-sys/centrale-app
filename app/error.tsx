'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[app] erreur non gérée', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf8f4] px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-12 h-12 rounded-full bg-[#f4e3e2] flex items-center justify-center text-[#9a3f3c] text-xl mx-auto mb-4">
          ⚠
        </div>
        <h1 className="font-semibold text-[20px] text-[#1a1a18] mb-2">
          Une erreur est survenue
        </h1>
        <p className="text-[14px] text-[#a8a499] mb-6 leading-relaxed">
          {error?.message || 'Erreur inattendue. Veuillez réessayer.'}
        </p>
        <button
          onClick={reset}
          className="bg-[#1a1a18] text-white font-semibold text-sm px-6 py-3 rounded-[10px] cursor-pointer border-none"
        >
          Réessayer
        </button>
      </div>
    </div>
  )
}
