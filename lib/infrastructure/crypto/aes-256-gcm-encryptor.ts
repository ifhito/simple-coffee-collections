import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  type CipherGCMTypes,
} from 'crypto'
import type { ApiKeyEncryptor } from './api-key-encryptor.interface'

const ALGORITHM: CipherGCMTypes = 'aes-256-gcm'
const IV_LENGTH = 12 // 96-bit IV (recommended for GCM)

function getEncryptionKey(): Buffer {
  const keyHex = process.env.LLM_ENCRYPTION_KEY
  if (!keyHex || keyHex.length !== 64) {
    throw new Error(
      'LLM_ENCRYPTION_KEY must be set to a 64-character hex string (32 bytes). ' +
        'Generate with: openssl rand -hex 32'
    )
  }
  return Buffer.from(keyHex, 'hex')
}

export class Aes256GcmEncryptor implements ApiKeyEncryptor {
  encrypt(plaintext: string): string {
    const key = getEncryptionKey()
    const iv = randomBytes(IV_LENGTH)
    const cipher = createCipheriv(ALGORITHM, key, iv)
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ])
    const tag = cipher.getAuthTag()
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`
  }

  decrypt(ciphertext: string): string {
    const key = getEncryptionKey()
    const parts = ciphertext.split(':')
    if (parts.length !== 3) {
      throw new Error('Invalid ciphertext format. Expected iv:tag:ciphertext')
    }
    const [ivHex, tagHex, encryptedHex] = parts
    const iv = Buffer.from(ivHex, 'hex')
    const tag = Buffer.from(tagHex, 'hex')
    const encrypted = Buffer.from(encryptedHex, 'hex')
    const decipher = createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(tag)
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
  }
}
