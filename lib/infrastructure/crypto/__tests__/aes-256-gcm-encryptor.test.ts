import { Aes256GcmEncryptor } from '../aes-256-gcm-encryptor'

// Use a deterministic 32-byte key for tests
const TEST_KEY = 'a'.repeat(64) // 64 hex chars = 32 bytes

describe('Aes256GcmEncryptor', () => {
  let encryptor: Aes256GcmEncryptor

  beforeEach(() => {
    process.env.LLM_ENCRYPTION_KEY = TEST_KEY
    encryptor = new Aes256GcmEncryptor()
  })

  afterEach(() => {
    delete process.env.LLM_ENCRYPTION_KEY
  })

  it('encrypts and decrypts a plaintext roundtrip', () => {
    const plaintext = 'sk-test-api-key-12345'
    const ciphertext = encryptor.encrypt(plaintext)
    const decrypted = encryptor.decrypt(ciphertext)
    expect(decrypted).toBe(plaintext)
  })

  it('produces different ciphertexts for same plaintext (random IV)', () => {
    const plaintext = 'sk-same-key'
    const c1 = encryptor.encrypt(plaintext)
    const c2 = encryptor.encrypt(plaintext)
    expect(c1).not.toBe(c2)
    expect(encryptor.decrypt(c1)).toBe(plaintext)
    expect(encryptor.decrypt(c2)).toBe(plaintext)
  })

  it('ciphertext has iv:tag:encrypted format', () => {
    const ciphertext = encryptor.encrypt('hello')
    const parts = ciphertext.split(':')
    expect(parts).toHaveLength(3)
    expect(parts[0]).toHaveLength(24) // 12 bytes = 24 hex
    expect(parts[1]).toHaveLength(32) // 16 bytes = 32 hex
  })

  it('throws on tampered ciphertext (GCM authentication failure)', () => {
    const ciphertext = encryptor.encrypt('sensitive-key')
    const parts = ciphertext.split(':')
    // Tamper with the encrypted data
    const tampered = `${parts[0]}:${parts[1]}:${'ff'.repeat(parts[2].length / 2)}`
    expect(() => encryptor.decrypt(tampered)).toThrow()
  })

  it('throws on malformed ciphertext', () => {
    expect(() => encryptor.decrypt('invalid-format')).toThrow()
  })

  it('throws when LLM_ENCRYPTION_KEY is not set', () => {
    delete process.env.LLM_ENCRYPTION_KEY
    const freshEncryptor = new Aes256GcmEncryptor()
    expect(() => freshEncryptor.encrypt('test')).toThrow('LLM_ENCRYPTION_KEY')
  })

  it('handles unicode strings', () => {
    const plaintext = '日本語のAPIキー-🔑'
    const ciphertext = encryptor.encrypt(plaintext)
    expect(encryptor.decrypt(ciphertext)).toBe(plaintext)
  })
})
