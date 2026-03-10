import { isHeicMimeType, isHeicExtension } from '../image-formats'

describe('isHeicMimeType', () => {
  it.each([
    'image/heic',
    'image/heif',
    'image/HEIC',
    'image/heic-sequence',
  ])('returns true for %s', (mime) => {
    expect(isHeicMimeType(mime)).toBe(true)
  })

  it.each([
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/plain',
  ])('returns false for %s', (mime) => {
    expect(isHeicMimeType(mime)).toBe(false)
  })
})

describe('isHeicExtension', () => {
  it.each([
    'photo.heic',
    'photo.HEIF',
    'IMG_001.heic',
  ])('returns true for %s', (name) => {
    expect(isHeicExtension(name)).toBe(true)
  })

  it.each([
    'photo.jpg',
    'photo.png',
    'heic.txt',
  ])('returns false for %s', (name) => {
    expect(isHeicExtension(name)).toBe(false)
  })
})
