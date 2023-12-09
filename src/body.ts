import { type IncomingMessage } from 'node:http'
import { FormParser, MultipartParser, JsonParser, TextParser } from './parsers/index.js'
import { InvalidContentLengthError, InvalidContentTypeError } from './errors.js'

const PARSER_MAP = new Map<string, BodyParser>([
  ['application/x-www-form-urlencoded', FormParser],
  ['multipart/form-data', MultipartParser],
  ['application/json', JsonParser],
  ['text/plain', TextParser]
])
export class Body {
  #type: string
  #limit = 1024 * 1024

  async #raw () {
    return await new Promise<Buffer>(resolve => {
      const data: Uint8Array[] = []
      this.req.on('data', chunk => {
        const length = data.length + chunk.length
        if (length > this.#limit) throw new InvalidContentLengthError()
        data.push(chunk)
      })
      this.req.on('end', () => resolve(Buffer.concat(data)))
    })
  }

  constructor (private readonly req: IncomingMessage) {
    this.#type = this.req.headers['content-type'] as string
  }

  #getParser () {
    const type = this.#type.split(';').shift() as string
    const parser = PARSER_MAP.get(type)
    if (!parser) throw new InvalidContentTypeError(this.#type)
    return parser
  }

  async parse<T extends BodyType = 'form'> (): Promise<BodyRequest[T]> {
    const parser = this.#getParser()
    const body = await this.#raw()
    return await parser(body, this.req) as BodyRequest[T]
  }
}
