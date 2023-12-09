import { type IncomingMessage } from 'node:http'

export function TextParser (body: Buffer, req: IncomingMessage) {
  const encoding = req.headers['content-encoding'] as BufferEncoding
  return body.toString(encoding || 'utf8')
}
