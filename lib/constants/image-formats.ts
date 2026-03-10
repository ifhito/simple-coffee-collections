/**
 * HEIC/HEIF MIME type detection pattern.
 * Matches: image/heic, image/heif, image/heic-sequence, etc.
 *
 * Used on both server (API route) and client (OCR controller) sides.
 */
export const HEIC_MIME_PATTERN = /^image\/(heic|heif)(?:[-+.\w]*)?$/i

export const HEIC_EXTENSION_PATTERN = /\.(heic|heif)$/i

export function isHeicMimeType(mimeType: string): boolean {
  return HEIC_MIME_PATTERN.test(mimeType)
}

export function isHeicExtension(fileName: string): boolean {
  return HEIC_EXTENSION_PATTERN.test(fileName)
}
