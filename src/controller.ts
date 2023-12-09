import type { IncomingMessage, ServerResponse } from 'node:http'
import { Config } from './config.js'
import { FileSystem } from './files.js'
import { Request } from './request.js'
import { Response } from './response.js'
import type { Router } from './router.js'

export class Controller {
  protected config: TokioConfig
  protected router: Router | undefined
  private readonly publicPath: string | undefined

  constructor (config: UserConfig) {
    this.config = new Config(config)
    if (this.config.public) this.publicPath = FileSystem.join(process.cwd(), this.config.public)
  }

  protected async exec (request: IncomingMessage, response: ServerResponse) {
    const req = new Request(request, this.config)
    const res = new Response(response)
    if (req.url === '/favicon.ico') return
    const isEndpoint = this.router?.match(req.url)
    const staticPath = FileSystem.absolutePath(this.publicPath + req.url)
    const isStatic = FileSystem.exists(staticPath)
    if (!isEndpoint && !isStatic) return res.notFound()
    if (!isEndpoint && isStatic) return res.file(staticPath)
    if (isEndpoint && !isStatic && !isEndpoint.module[req.method]) return res.methodNotAllowed()
    if (!isEndpoint?.module) return res.notFound()
    const { module, regex } = isEndpoint
    if (!module[req.method as Method]) return res.methodNotAllowed()
    req.regex = new RegExp(regex, 'i')
    const handler = module[req.method as Method] as Handler
    await handler(req, res)
  }
}
