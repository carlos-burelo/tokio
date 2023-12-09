import type { ServerResponse } from 'node:http'
import { join } from 'node:path'
import { readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'

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

  sendResponse (code: number, data: string | Buffer) {
    this.status(code).send(data)
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
  ok (message: string = 'OK'): void {
    this.sendResponse(200, message)
  }

  created (message: string = 'Created') {
    this.sendResponse(201, message)
  }

  accepted (message: string = 'Accepted') {
    this.sendResponse(202, message)
  }

  noContent (message: string = 'No Content') {
    this.sendResponse(204, message)
  }

  badRequest (message: string = 'Bad Request') {
    this.sendResponse(400, message)
  }

  unauthorized (message: string = 'Unauthorized') {
    this.sendResponse(401, message)
  }

  forbidden (message: string = 'Forbidden') {
    this.sendResponse(403, message)
  }

  notFound (message: string = 'Not Found') {
    this.sendResponse(404, message)
  }

  methodNotAllowed (message: string = 'Method Not Allowed') {
    this.sendResponse(405, message)
  }

  conflict (message: string = 'Conflict') {
    this.sendResponse(409, message)
  }

  internalServerError (message: string = 'Internal Server Error') {
    this.sendResponse(500, message)
  }

  notImplemented (message: string = 'Not Implemented') {
    this.sendResponse(501, message)
  }

  badGateway (message: string = 'Bad Gateway') {
    this.sendResponse(502, message)
  }

  serviceUnavailable (message: string = 'Service Unavailable') {
    this.sendResponse(503, message)
  }

  gatewayTimeout (message: string = 'Gateway Timeout') {
    this.sendResponse(504, message)
  }

  httpVersionNotSupported (message: string = 'HTTP Version Not Supported') {
    this.sendResponse(505, message)
  }

  networkAuthenticationRequired (message: string = 'Network Authentication Required') {
    this.sendResponse(511, message)
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
