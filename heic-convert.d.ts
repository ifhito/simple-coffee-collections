declare module 'heic-convert' {
  type InputBuffer = Buffer | Uint8Array | ArrayBuffer

  type ConvertOptions = {
    buffer: InputBuffer
    format: 'JPEG' | 'PNG'
    quality?: number
  }

  export default function heicConvert(options: ConvertOptions): Promise<InputBuffer>
}
