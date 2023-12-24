import type { BodyParser, NodeRequest } from '../types.js'

export class JsonParser implements BodyParser<object> {
  constructor (private readonly body: Buffer, private readonly req: NodeRequest) {}

  async parse () {
    const encoding = this.req.headers['content-encoding'] as BufferEncoding
    return JSON.parse(this.body.toString(encoding || 'utf8'))
  }
}
