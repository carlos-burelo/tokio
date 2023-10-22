import type { ServerResponse } from 'http'
import { join } from 'path'
import { readFileSync } from 'fs'
import { readFile } from 'fs/promises'

export class Response {
  constructor (private readonly res: ServerResponse) {}

  get headers (): Header {
    return new Header(this.res)
  }

  get cookies (): Cookie {
    return new Cookie(this.res)
  }

  status (code: number) {
    this.res.statusCode = code
    return this
  }

  send (data: string | Buffer): void {
    this.res.end(data)
  }

  json (data: object): void {
    this.headers.add('Content-Type', 'application/json; charset=utf-8')
    this.send(JSON.stringify(data))
  }

  redirect (url: string): void {
    this.status(302)
    this.headers.add('Location', url)
    this.send('Redirecting to ' + url)
  }

  html (html: string): void {
    this.headers.add('Content-Type', 'text/html; charset=utf-8')
    this.send(html)
  }

  text (text: string): void {
    this.headers.add('Content-Type', 'text/plain; charset=utf-8')
    this.send(text)
  }

  raw (data: Buffer): void {
    this.send(data)
  }

  file (path: string): void {
    const data = readFileSync(path)
    this.raw(data)
  }

  async view (path: string) {
    const data = await readFile(path, 'utf-8')
    this.html(data)
  }

  download (path: string, filename?: string): void {
    const data = readFileSync(join(process.cwd(), path))
    this.headers.add('Content-Disposition', `attachment; filename=${filename}`)
    this.raw(data)
  }

  // suggar methods
  ok (): void {
    this.status(200).send('OK')
  }

  created (): void {
    this.status(201).send('Created')
  }

  accepted (): void {
    this.status(202).send('Accepted')
  }

  noContent (): void {
    this.status(204).send('No Content')
  }

  badRequest (): void {
    this.status(400).send('Bad Request')
  }

  unauthorized (): void {
    this.status(401).send('Unauthorized')
  }

  forbidden (): void {
    this.status(403).send('Forbidden')
  }

  notFound (): void {
    this.status(404).send('Not Found')
  }

  methodNotAllowed (): void {
    this.status(405).send('Method Not Allowed')
  }

  conflict (): void {
    this.status(409).send('Conflict')
  }

  internalServerError (): void {
    this.status(500).send('Internal Server Error')
  }

  notImplemented (): void {
    this.status(501).send('Not Implemented')
  }

  badGateway (): void {
    this.status(502).send('Bad Gateway')
  }

  serviceUnavailable (): void {
    this.status(503).send('Service Unavailable')
  }
}

class Header {
  constructor (private readonly res: ServerResponse) {}
  add (key: string, value: string): void {
    this.res.setHeader(key, value)
  }

  get (key: string): string | string[] | number | undefined {
    return this.res.getHeader(key)
  }
}

interface CookieOptions {
  domain?: string
  expires?: Date
  httpOnly?: boolean
  maxAge?: number
  path?: string
  sameSite?: boolean | 'lax' | 'strict' | 'none'
  secure?: boolean
}

class Cookie {
  constructor (private readonly res: ServerResponse) {}

  set (key: string, value: string, options: CookieOptions = {}): void {
    const cookie = `${key}=${value}; ${this.serialize(options)}`
    this.res.setHeader('Set-Cookie', cookie)
  }

  get (key: string): string | undefined {
    const cookie = this.res.getHeader('Set-Cookie')
    if (typeof cookie === 'string') {
      return cookie
    }
    if (Array.isArray(cookie)) {
      return cookie.find(c => c.startsWith(key))
    }
    return undefined
  }

  private serialize (options: CookieOptions): string {
    const pairs = Object.entries(options)
    const strPairs = pairs.map(([k, v]) => {
      if (k === 'expires') {
        return `${k}=${v.toUTCString()}`
      }
      if (k === 'maxAge') {
        return `${k}=${v}`
      }
      return `${k}=${encodeURIComponent(v as string)}`
    })
    return strPairs.join('; ')
  }
}
