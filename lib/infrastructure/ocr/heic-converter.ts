import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { promises as fs } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import heicConvert from 'heic-convert'
import sharp from 'sharp'

const execFileAsync = promisify(execFile)

function toBuffer(data: Buffer | Uint8Array | ArrayBuffer): Buffer {
  if (Buffer.isBuffer(data)) return data
  if (data instanceof ArrayBuffer) return Buffer.from(data)
  return Buffer.from(data)
}

/**
 * Convert a HEIC/HEIF image buffer to JPEG using a multi-fallback strategy:
 *   1. sharp (requires libvips HEIC decoder)
 *   2. heic-convert (WASM-based, cross-platform)
 *   3. sips (macOS-only CLI tool)
 *
 * Returns null if all strategies fail.
 */
export async function convertHeicToJpeg(imageBuffer: Buffer): Promise<Buffer | null> {
  // 1. sharp (fastest when available)
  try {
    return await sharp(imageBuffer).jpeg({ quality: 90 }).toBuffer()
  } catch {
    // Fall through to cross-platform converter.
  }

  // 2. heic-convert (WASM-based decoder)
  try {
    const converted = await heicConvert({
      buffer: imageBuffer,
      format: 'JPEG',
      quality: 0.9,
    })
    const convertedBuffer = toBuffer(converted)
    if (convertedBuffer.length > 0) return convertedBuffer
  } catch {
    // Fall through to platform-specific converter.
  }

  // 3. macOS sips fallback
  if (process.platform !== 'darwin') {
    return null
  }

  const id = randomUUID()
  const inputPath = join(tmpdir(), `ocr-heic-${id}.heic`)
  const outputPath = join(tmpdir(), `ocr-heic-${id}.jpg`)

  try {
    await fs.writeFile(inputPath, imageBuffer)
    await execFileAsync('/usr/bin/sips', ['-s', 'format', 'jpeg', inputPath, '--out', outputPath])
    const converted = await fs.readFile(outputPath)
    return converted.length > 0 ? converted : null
  } catch {
    return null
  } finally {
    await Promise.allSettled([
      fs.rm(inputPath, { force: true }),
      fs.rm(outputPath, { force: true }),
    ])
  }
}
