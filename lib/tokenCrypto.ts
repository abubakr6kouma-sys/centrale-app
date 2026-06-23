import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'

function getKey(): Buffer {
  const hex = process.env.TOKEN_ENCRYPTION_KEY
  if (!hex || hex.length !== 64) {
    throw new Error(
      'TOKEN_ENCRYPTION_KEY manquant ou invalide. Générez-en un avec : openssl rand -hex 32'
    )
  }
  return Buffer.from(hex, 'hex')
}

// Format stocké : iv(12 octets):authTag(16 octets):ciphertext, tout en hexadécimal,
// concaténé par des deux-points pour rester lisible en base sans colonnes binaires.
export function encryptToken(plainText: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

export function decryptToken(stored: string): string {
  const key = getKey()
  const [ivHex, authTagHex, dataHex] = stored.split(':')
  if (!ivHex || !authTagHex || !dataHex) {
    throw new Error('Format de token chiffré invalide.')
  }
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'))
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataHex, 'hex')),
    decipher.final(),
  ])
  return decrypted.toString('utf8')
}
