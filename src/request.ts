import { Body } from './body.js'
import type { ConfigImpl, Req, NodeRequest, KVImpl, HttpMethod, Obj } from './types.js'

export class TokioRequest implements Req {
  constructor (
    private readonly req: NodeRequest,
    private readonly config: ConfigImpl) {}

  regex: RegExp = /./

  readonly #kvStore: KvStore = new KvStore()

  get kv (): KVImpl {
    return this.#kvStore
  }

  get #URL () {
    return new URL(this.req.url!, this.config.host)
  }

  get url () {
    return this.#URL.pathname
  }

  get method () {
    return this.req.method as HttpMethod
  }

  get headers (): Record<string, string> {
    return this.req.headers as Record<string, string>
  }

  get ip () {
    return this.req.socket.remoteAddress!
  }

  get host () {
    return this.req.headers.host!
  }

  get origin () {
    return this.req.headers.origin!
  }

  get referer () {
    return this.req.headers.referer!
  }

  get cookie () {
    return this.req.headers.cookie!
  }

  get userAgent () {
    return this.req.headers['user-agent']!
  }

  get contentType () {
    return this.req.headers['content-type']!
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

class KvStore implements KVImpl {
  #kvStore: Record<string, unknown> = {}
  get <T = unknown>(key: string): T {
    return this.#kvStore[key] as T
  }

  set (key: string, value: unknown): void {
    this.#kvStore[key] = value
  }
}
