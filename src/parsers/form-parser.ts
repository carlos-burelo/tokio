import querystring from 'node:querystring'
import type { BodyParser, NodeRequest } from '../types.js'

export class FormParser implements BodyParser<object> {
  constructor (private readonly body: Buffer, private readonly req: NodeRequest) {}

  async parse () {
    const encoding = this.req.headers['content-encoding'] as BufferEncoding
    return querystring.parse(this.body.toString(encoding || 'utf8'))
  }
}
