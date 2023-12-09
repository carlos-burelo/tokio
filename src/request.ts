import type { IncomingMessage } from 'node:http'
import { Body } from './body.js'

export class Request {
  constructor (
    private readonly req: IncomingMessage,
    private readonly config: TokioConfig) {}

  regex: RegExp = /./

  get #URL () {
    return new URL(this.req.url as string, this.config.host)
  }

  get url () {
    return this.#URL.pathname
  }

  get method () {
    return this.req.method as Method
  }

  get headers () {
    return this.req.headers
  }

  get ip () {
    return this.req.socket.remoteAddress
  }

  get host () {
    return this.headers.host
  }

  get origin () {
    return this.headers.origin
  }

  get referer () {
    return this.headers.referer
  }

  get userAgent () {
    return this.headers['user-agent']
  }

  get contentType () {
    return this.headers['content-type']
  }

  params <T = string>() {
    const groups = new RegExp(this.regex, 'i').exec(this.url)?.groups
    return (groups ? { ...groups } : {}) as Obj<T>
  }

  segments (): string[] {
    const match = new RegExp(this.regex, 'i').exec(this.url) ?? []
    if (!match) return []
    const [segments] = match
    return segments?.split('/').slice(1).filter(Boolean) ?? []
  }

  queries () {
    const { searchParams } = this.#URL
    return Object.fromEntries(searchParams) as Obj
  }

  query (key: string) {
    const { searchParams } = this.#URL
    return searchParams.getAll(key)
  }

  async body <T = Obj<unknown>>() {
    return await new Body(this.req).parse() as T
  }
}
