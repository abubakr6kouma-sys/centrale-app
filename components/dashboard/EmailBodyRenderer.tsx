'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  content: string
  emailId?: string
}

export default function EmailBodyRenderer({ content, emailId }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(480)
  const [loaded, setLoaded] = useState(false)

  // Listen for height reports from the iframe's trusted script
  useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (e.origin !== window.location.origin) return
      if (e.data?.type === 'email-height' && typeof e.data.h === 'number') {
        setHeight(Math.max(e.data.h + 24, 80))
      }
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [])

  // Reset when switching emails
  useEffect(() => {
    setLoaded(false)
    setHeight(480)
  }, [emailId])

  if (!emailId) {
    return (
      <p className="text-[13.5px] text-muted leading-[1.7] m-0 whitespace-pre-wrap break-words">
        {content}
      </p>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-lg">
      {!loaded && (
        <div className="flex items-center gap-[9px] py-2">
          <span className="w-[11px] h-[11px] rounded-full border border-line border-t-[#b08968] animate-spin flex-none" />
          <span className="text-[12px] text-faint">Chargement…</span>
        </div>
      )}
      <iframe
        ref={iframeRef}
        key={emailId}
        src={`/api/emails/${emailId}/html-render`}
        // allow-scripts: needed only for our trusted resize+link-fix script (injected server-side)
        // No allow-same-origin: prevents email content from accessing parent cookies/DOM
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
        onLoad={() => setLoaded(true)}
        style={{
          display: loaded ? 'block' : 'none',
          width: '100%',
          height: `${height}px`,
          border: 'none',
          minHeight: '80px',
        }}
        title="Email"
      />
    </div>
  )
}
