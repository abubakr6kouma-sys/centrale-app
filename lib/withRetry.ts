// Liste des codes/messages d'erreur réseau transitoires qu'il est raisonnable
// de retenter automatiquement, plutôt que de faire échouer toute la synchro.
// ERR_STREAM_PREMATURE_CLOSE est un bug documenté de node-fetch (utilisé en
// interne par googleapis/gaxios) sur la réutilisation de sockets keep-alive :
// il échoue parfois sans raison liée à la requête elle-même, et un simple
// retry suffit dans l'immense majorité des cas.
const RETRYABLE_PATTERNS = [
  'ERR_STREAM_PREMATURE_CLOSE',
  'Premature close',
  'ECONNRESET',
  'ETIMEDOUT',
  'socket hang up',
]

function isRetryableError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err)
  const code = (err as { code?: string })?.code || ''
  return RETRYABLE_PATTERNS.some((p) => message.includes(p) || code.includes(p))
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { retries?: number; baseDelayMs?: number; label?: string } = {}
): Promise<T> {
  const { retries = 2, baseDelayMs = 400, label = 'opération' } = options
  let lastError: unknown

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`[RETRY] ${label} — tentative ${attempt + 1}/${retries + 1}`)
      }
      return await fn()
    } catch (err) {
      lastError = err
      const retryable = isRetryableError(err)
      console.error(
        `[ERROR] ${label} a échoué (tentative ${attempt + 1}/${retries + 1}) — retryable: ${retryable}`,
        err instanceof Error ? err.message : err
      )
      if (!retryable || attempt === retries) {
        throw err
      }
      const delay = baseDelayMs * Math.pow(2, attempt)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError
}
