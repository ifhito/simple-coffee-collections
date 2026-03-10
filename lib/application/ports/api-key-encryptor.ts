export interface ApiKeyEncryptor {
  encrypt(plaintext: string): string
  decrypt(ciphertext: string): string
}
