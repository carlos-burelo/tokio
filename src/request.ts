import { type IncomingMessage } from 'http'
import type { Method } from './types.js'

const COOKIE_REG = /([^;=\s]*)=([^;]*)/g

const HOST = process.env.HOST ?? 'http://localhost'

export class Request {
  constructor (private readonly req: IncomingMessage) {}

  public match: RegExp = /(?<path>\/[a-zA-Z0-9-._~%!$&'()*+,;=:@/]*)(?<query>\?.*)?/

  get url () {
    const uri = new URL(this.req.url as string, HOST)
    return uri.pathname
  }

  params<T = Record<string, string>>() {
    const exec = new RegExp(this.match, 'i').exec(this.url)?.groups
    return (exec ? { ...exec } : {}) as T
  }

  query<T = Record<string, string>>() {
    const { searchParams } = new URL(this.req.url as string, HOST)
    return Object.fromEntries(searchParams) as T
  }

  queries (name: string): string[] {
    const { searchParams } = new URL(this.req.url as string, HOST)
    return searchParams.getAll(name)
  }

  cookies (): object {
    const cookie = this.req.headers.cookie ?? ''
    return Object.fromEntries(
      Array.from(cookie.matchAll(COOKIE_REG), m => [m[1], decodeURIComponent(m[2])])
    )
  }

  async files (): Promise<Record<string, File>> {
    const contentType = this.req.headers['content-type'] ?? ''
    if (contentType.startsWith('multipart/form-data')) {
      const fu = new FileUpload(this.req)
      const boundary = contentType.split('boundary=')[1]
      if (!boundary) return {}
      const formData = await fu.parseMultipartFormData(boundary)
      const files: Record<string, File> = {}
      for (const [key, { data, filename, mimeType }] of formData) {
        files[key] = new File(data, mimeType, filename)
      }
      return files
    }
    return {}
  }

  get headers (): object {
    return this.req.headers as object
  }

  get ip () {
    return this.req.socket.remoteAddress
  }

  get method (): Method {
    return this.req.method as Method
  }

  get host () {
    return this.req.headers.host
  }
}

class File {
  constructor (public data: Buffer, public mimeType: string, public filename: string) {}
}

class FileUpload {
  constructor (private readonly req: IncomingMessage) {}
  async getRequestBody (): Promise<string> {
    let body = ''
    for await (const c of this.req) body += c
    return body
  }

  async parseMultipartFormData (
    boundary: string
  ): Promise<Map<string, { data: Buffer, mimeType: string, filename: string }>> {
    const formData = new Map<string, { data: Buffer, mimeType: string, filename: string }>()
    const body = await this.getRequestBody()
    const sections = body.split(`--${boundary}`).slice(1, -1)

    for (const section of sections) {
      const headersEnd = section.indexOf('\r\n\r\n') + 4
      const headers = section.substring(0, headersEnd)
      const content = section.substring(headersEnd)
      const partHeaders: Record<string, string> = {}

      headers
        .trim()
        .split('\r\n')
        .forEach(line => {
          const [key, value] = line.split(': ')
          partHeaders[key.toLowerCase()] = value
        })

      if (partHeaders['content-disposition']) {
        const disposition = partHeaders['content-disposition']
        const nameMatch = disposition.match(/name="([^"]+)"/)
        const filenameMatch = disposition.match(/filename="([^"]+)"/)

        if (nameMatch) {
          const name = nameMatch[1]
          if (filenameMatch) {
            const filename = filenameMatch[1]
            const mimeType = partHeaders['content-type'] || 'application/octet-stream'
            formData.set(name, {
              data: Buffer.from(content),
              mimeType,
              filename
            })
          }
        }
      }
    }
    return formData
  }
}
