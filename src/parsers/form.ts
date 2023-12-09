import { type IncomingMessage } from 'http'
import querystring from 'querystring'

export function FormParser (body: Buffer, req: IncomingMessage) {
  const encoding = req.headers['content-encoding'] as BufferEncoding
  return querystring.parse(body.toString(encoding || 'utf8'))
}
