import { type IncomingMessage } from 'http'

export function JsonParser (body: Buffer, req: IncomingMessage) {
  const encoding = req.headers['content-encoding'] as BufferEncoding
  return JSON.parse(body.toString(encoding || 'utf8'))
}
