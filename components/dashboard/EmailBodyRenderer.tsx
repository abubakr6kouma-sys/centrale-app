'use client'

import { useEffect, useState } from 'react'

// Detects whether stored body_full is HTML (new/backfilled emails) or plain text (old emails)
function isHtmlContent(content: string): boolean {
  const t = content.trimStart().slice(0, 500)
  return t.startsWith('<') && /<(html|body|div|table|tr|td|p\b|br\b|span|a\b|img\b|h[1-6]|ul|ol|li|strong|em|font)[^>]*>/i.test(t)
}

// Splits plain text on URLs and returns alternating text/link React nodes
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

  return nodes
}

interface EmailBodyRendererProps {
  content: string
}

export default function EmailBodyRenderer({ content }: EmailBodyRendererProps) {
  const [safeHtml, setSafeHtml] = useState<string | null>(null)
  const isHtml = isHtmlContent(content)

  useEffect(() => {
    if (!isHtml) return
    let cancelled = false

    import('dompurify').then(({ default: DOMPurify }) => {
      if (cancelled) return

      DOMPurify.addHook('afterSanitizeAttributes', (node) => {
        if (node.tagName === 'A') {
          node.setAttribute('target', '_blank')
          node.setAttribute('rel', 'noopener noreferrer')
        }
        // Block 1×1 tracking pixels
        if (node.tagName === 'IMG') {
          const w = parseInt(node.getAttribute('width') || '0', 10)
          const h = parseInt(node.getAttribute('height') || '0', 10)
          if ((w > 0 && w <= 2) || (h > 0 && h <= 2)) {
            node.setAttribute('src', '')
            node.setAttribute('style', 'display:none')
          }
        }
      })

      const clean = DOMPurify.sanitize(content, {
        FORBID_TAGS: ['script', 'style', 'link', 'meta', 'base', 'object', 'embed', 'form', 'input'],
        FORCE_BODY: true,
        ADD_ATTR: ['target', 'rel'],
      })

      DOMPurify.removeAllHooks()
      if (!cancelled) setSafeHtml(clean)
    })

    return () => { cancelled = true }
  }, [content, isHtml])

  if (!isHtml) {
    return (
      <p className="text-[13.5px] text-muted leading-[1.7] m-0 whitespace-pre-wrap break-words">
        {renderPlainText(content)}
      </p>
    )
  }

  if (safeHtml === null) {
    return (
      <p className="text-[13.5px] text-faint leading-[1.7] m-0">Chargement…</p>
    )
  }

  return (
    <div
      className="email-html-body text-[13.5px] leading-[1.6] text-[#3a3a36] overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  )
}
