import type { BodyParser, NodeRequest } from '../types.js'

export class TextParser implements BodyParser<string> {
  constructor (private readonly body: Buffer, private readonly req: NodeRequest) {}

  async parse () {
    const encoding = this.req.headers['content-encoding'] as BufferEncoding
    return this.body.toString(encoding || 'utf8')
  }
}
