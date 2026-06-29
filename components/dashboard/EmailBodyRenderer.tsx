'use client'

import { useEffect, useRef, useState } from 'react'

interface EmailBodyRendererProps {
  content: string
  emailId?: string
}

export default function EmailBodyRenderer({ content, emailId }: EmailBodyRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(300)
  const [loaded, setLoaded] = useState(false)

  // Listen for postMessage height updates from the iframe
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      // Only accept messages from our own origin
      if (e.origin !== window.location.origin) return
      if (e.data?.type === 'email-height' && typeof e.data.h === 'number') {
        setHeight(Math.max(e.data.h + 16, 80))
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  // When emailId changes, reset state
  useEffect(() => {
    setHeight(300)
    setLoaded(false)
  }, [emailId])

  if (!emailId) {
    // Fallback: render plain text inline
    return (
      <p className="text-[13.5px] text-muted leading-[1.7] m-0 whitespace-pre-wrap break-words">
        {content}
      </p>
    )
  }

  return (
    <div className="relative">
      {!loaded && (
        <div className="flex items-center gap-2 py-4">
          <span className="w-3 h-3 rounded-full border border-line border-t-[#b08968] animate-spin flex-none" />
          <span className="text-[12px] text-faint">Chargement du rendu…</span>
        </div>
      )}
      <iframe
        ref={iframeRef}
        key={emailId}
        src={`/api/emails/${emailId}/html-render`}
        // allow-scripts: needed for our auto-resize postMessage script (injected server-side)
        // No allow-same-origin: prevents email content from accessing parent cookies
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
        onLoad={() => setLoaded(true)}
        className="w-full border-none block"
        style={{
          height: `${height}px`,
          display: loaded ? 'block' : 'none',
          minHeight: '80px',
        }}
        title="Contenu de l'email"
      />
    </div>
  )
}
