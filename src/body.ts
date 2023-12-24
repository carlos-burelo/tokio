import { FormParser, JsonParser, MultipartParser, TextParser } from './parsers/index.js'
import type { ParserConstructor, BodyImpl, NodeRequest, BodyType, BodyRequest } from './types.js'

const PARSER_MAP = new Map<string, ParserConstructor>([
  ['application/x-www-form-urlencoded', FormParser],
  ['application/json', JsonParser],
  ['multipart/form-data', MultipartParser],
  ['text/plain', TextParser]
])

export class Body implements BodyImpl {
  readonly #type: string
  readonly #limit = 1024 * 1024

  async #raw () {
    return await new Promise<Buffer>(resolve => {
      const data: Uint8Array[] = []
      this.req.on('data', (chunk: Uint8Array) => {
        const length = data.length + chunk.length
        if (length > this.#limit) throw new Error()
        data.push(chunk)
      })
      this.req.on('end', () => resolve(Buffer.concat(data)))
    })
  }

  constructor (private readonly req: NodeRequest) {
    this.#type = this.req.headers['content-type']!
  }

  #getParser () {
    const type = this.#type.split(';').shift()!
    const parser = PARSER_MAP.get(type)
    if (!parser) throw new Error(this.#type)
    return parser
  }

  async parse<T extends BodyType = 'form'> (): Promise<BodyRequest[T]> {
    const Parser = this.#getParser()
    const body = await this.#raw()
    const instance = new Parser(body, this.req)
    return await instance.parse() as BodyRequest[T]
  }
}
