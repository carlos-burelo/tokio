import { join } from 'node:path'
import { readFile } from 'node:fs/promises'
import type { Res, NodeResponse, HeaderImpl, CookieOptions, CookieImpl } from './types.js'

export class Response implements Res {
  constructor (private readonly res: NodeResponse) {}

  get headers (): HeaderImpl {
    return new Header(this.res)
  }

  get cookies (): Cookie {
    return new Cookie(this.res)
  }

  get code (): number {
    return this.res.statusCode
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
    this.headers.set('Content-Type', 'application/json; charset=utf-8')
    this.send(JSON.stringify(data))
  }

  redirect (url: string): void {
    this.status(302)
    this.headers.set('Location', url)
    this.send('Redirecting to ' + url)
  }

  html (html: string): void {
    this.headers.set('Content-Type', 'text/html; charset=utf-8')
    this.send(html)
  }

  text (text: string): void {
    this.headers.set('Content-Type', 'text/plain; charset=utf-8')
    this.send(text)
  }

  raw (data: Buffer): void {
    this.send(data)
  }

  async file (path: string) {
    const data = await readFile(path)
    this.raw(data)
  }

  async view (path: string) {
    const data = await readFile(path, 'utf-8')
    this.html(data)
  }

  async download (path: string, filename?: string) {
    const data = await readFile(join(process.cwd(), path))
    this.headers.set('Content-Disposition', `attachment; filename=${filename}`)
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
class Header implements HeaderImpl {
  constructor (private readonly res: NodeResponse) {}
  set (key: string, value: string): void {
    this.res.setHeader(key, value)
  }

  get (key: string) {
    return this.res.getHeader(key)
  }
}
class Cookie implements CookieImpl {
  constructor (private readonly res: NodeResponse) {}

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
