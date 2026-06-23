import { gmail_v1 } from 'googleapis'

export interface ParsedGmailMessage {
  gmailMessageId: string
  gmailThreadId: string | null
  senderName: string | null
  senderEmail: string
  subject: string | null
  bodyText: string
  receivedAt: string
}

function getHeader(headers: gmail_v1.Schema$MessagePartHeader[] | undefined, name: string) {
  return headers?.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || null
}

function decodeBase64Url(data: string): string {
  const normalized = data.replace(/-/g, '+').replace(/_/g, '/')
  return Buffer.from(normalized, 'base64').toString('utf8')
}

// Les emails ont une structure MIME arborescente (text/plain, text/html, et
// souvent les deux dans des branches multipart/alternative). On cherche en
// profondeur la première partie text/plain ; à défaut on prend du text/html
// et on retire grossièrement les balises pour rester lisible.
function extractBody(part: gmail_v1.Schema$MessagePart | undefined): {
  plain: string | null
  html: string | null
} {
  if (!part) return { plain: null, html: null }

  if (part.mimeType === 'text/plain' && part.body?.data) {
    return { plain: decodeBase64Url(part.body.data), html: null }
  }
  if (part.mimeType === 'text/html' && part.body?.data) {
    return { plain: null, html: decodeBase64Url(part.body.data) }
  }

  if (part.parts) {
    for (const sub of part.parts) {
      const result = extractBody(sub)
      if (result.plain) return result
    }
    for (const sub of part.parts) {
      const result = extractBody(sub)
      if (result.html) return result
    }
  }

  return { plain: null, html: null }
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function parseSender(fromHeader: string | null): { name: string | null; email: string } {
  if (!fromHeader) return { name: null, email: 'inconnu@inconnu.com' }
  const match = fromHeader.match(/^(.*?)\s*<(.+)>$/)
  if (match) {
    const name = match[1].replace(/"/g, '').trim()
    return { name: name || null, email: match[2].trim() }
  }
  return { name: null, email: fromHeader.trim() }
}

// Tronque le corps stocké en base pour éviter qu'une signature HTML géante
// ou un email-newsletter démesuré ne gonfle inutilement le stockage Supabase.
const MAX_BODY_LENGTH = 6000

export function parseGmailMessage(message: gmail_v1.Schema$Message): ParsedGmailMessage {
  const headers = message.payload?.headers
  const { name: senderName, email: senderEmail } = parseSender(getHeader(headers, 'From'))
  const subject = getHeader(headers, 'Subject')
  const dateHeader = getHeader(headers, 'Date')

  const { plain, html } = extractBody(message.payload)
  let bodyText = plain || (html ? stripHtml(html) : '') || message.snippet || ''
  if (bodyText.length > MAX_BODY_LENGTH) {
    bodyText = bodyText.slice(0, MAX_BODY_LENGTH) + '…'
  }

  const receivedAt = dateHeader
    ? new Date(dateHeader).toISOString()
    : message.internalDate
      ? new Date(Number(message.internalDate)).toISOString()
      : new Date().toISOString()

  return {
    gmailMessageId: message.id || '',
    gmailThreadId: message.threadId || null,
    senderName,
    senderEmail,
    subject,
    bodyText,
    receivedAt,
  }
}

// Construit un message MIME brut RFC 2822 minimal pour l'envoi, encodé en
// base64url comme l'exige l'API Gmail (messages.send).
export function buildRawEmail(params: {
  to: string
  from: string
  subject: string
  body: string
  inReplyToMessageId?: string | null
}): string {
  const lines = [
    `To: ${params.to}`,
    `From: ${params.from}`,
    `Subject: ${encodeSubject(params.subject)}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
  ]
  if (params.inReplyToMessageId) {
    lines.push(`In-Reply-To: <${params.inReplyToMessageId}>`)
    lines.push(`References: <${params.inReplyToMessageId}>`)
  }
  lines.push('', params.body)

  const raw = lines.join('\r\n')
  return Buffer.from(raw)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function encodeSubject(subject: string): string {
  // Encode le sujet en UTF-8 (RFC 2047) pour préserver les accents français.
  return `=?UTF-8?B?${Buffer.from(subject, 'utf8').toString('base64')}?=`
}
