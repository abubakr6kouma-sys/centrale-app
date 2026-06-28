'use client'

import { useEffect, useState } from 'react'

function isHtmlContent(content: string): boolean {
  const t = content.trimStart().slice(0, 500)
  return (
    t.startsWith('<') &&
    /<(html|body|div|table|tr|td|p\b|br\b|span|a\b|img\b|h[1-6]|ul|ol|li|strong|em|font)[^>]*>/i.test(t)
  )
}

function renderPlainText(text: string): React.ReactNode[] {
  const urlRe = /https?:\/\/[^\s<>"]+[^\s<>".,!?;:)]+/g
  const nodes: React.ReactNode[] = []
  let lastIndex = 0
  let m: RegExpExecArray | null

  while ((m = urlRe.exec(text)) !== null) {
    if (m.index > lastIndex) {
      nodes.push(<span key={`t${lastIndex}`}>{text.slice(lastIndex, m.index)}</span>)
    }
    const url = m[0]
    const display = url.length > 55 ? url.slice(0, 52) + '…' : url
    nodes.push(
      <a
        key={`u${m.index}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#8a6648] underline break-all"
      >
        {display}
      </a>
    )
    lastIndex = m.index + url.length
  }

  if (lastIndex < text.length) {
    nodes.push(<span key={`t${lastIndex}`}>{text.slice(lastIndex)}</span>)
  }

  return nodes.length > 0 ? nodes : [<span key="0">{text}</span>]
}

async function buildSafeHtml(rawHtml: string): Promise<string> {
  const { default: DOMPurify } = await import('dompurify')

  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
      node.setAttribute('target', '_blank')
      node.setAttribute('rel', 'noopener noreferrer')
    }
    if (node.tagName === 'IMG') {
      const w = parseInt(node.getAttribute('width') || '0', 10)
      const h = parseInt(node.getAttribute('height') || '0', 10)
      if ((w > 0 && w <= 2) || (h > 0 && h <= 2)) {
        node.setAttribute('src', '')
        node.setAttribute('style', 'display:none')
      }
    }
  })

  const clean = DOMPurify.sanitize(rawHtml, {
    FORBID_TAGS: ['script', 'link', 'meta', 'base', 'object', 'embed', 'form', 'input'],
    FORCE_BODY: true,
    ADD_ATTR: ['target', 'rel'],
  })

  DOMPurify.removeAllHooks()
  return clean
}

interface EmailBodyRendererProps {
  content: string
  emailId?: string
}

export default function EmailBodyRenderer({ content, emailId }: EmailBodyRendererProps) {
  const [safeHtml, setSafeHtml] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setSafeHtml(null)
    let cancelled = false

    async function init() {
      if (isHtmlContent(content)) {
        // Body already stored as HTML — sanitize directly
        const clean = await buildSafeHtml(content)
        if (!cancelled) setSafeHtml(clean)
        return
      }

      // Body is plain text — fetch HTML from Gmail on demand
      if (!emailId) return
      setLoading(true)
      try {
        const res = await fetch(`/api/emails/${emailId}/html-body`)
        if (!res.ok) return
        const data = await res.json()
        if (data.html && !cancelled) {
          const clean = await buildSafeHtml(data.html)
          if (!cancelled) setSafeHtml(clean)
        }
      } catch {
        // Silently fall back to plain text rendering
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    init()
    return () => { cancelled = true }
  }, [content, emailId])

  // Rendered HTML (either from stored HTML or freshly fetched from Gmail)
  if (safeHtml !== null) {
    return (
      <div
        className="email-html-body text-[13.5px] leading-[1.6] text-[#3a3a36] overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    )
  }

  // Plain text fallback — also shown while HTML is loading
  return (
    <div>
      {loading && (
        <div className="flex items-center gap-2 mb-3">
          <span className="w-3 h-3 rounded-full border border-line border-t-[#b08968] animate-spin flex-none" />
          <span className="text-[12px] text-faint">Rendu HTML en cours…</span>
        </div>
      )}
      <p className="text-[13.5px] text-muted leading-[1.7] m-0 whitespace-pre-wrap break-words">
        {renderPlainText(content)}
      </p>
    </div>
  )
}
