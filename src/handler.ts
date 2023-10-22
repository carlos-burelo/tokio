import type { IncomingMessage, ServerResponse } from 'http'
import { FS } from './files.js'
import { Request } from './request.js'
import { Response } from './response.js'
import type { Router } from './router.js'
import type { Method, TokioOptions, Action } from './types.js'

export class Handler {
  protected router: Router | null = null

  private readonly staticPath: string | undefined

  constructor (protected options: TokioOptions) {
    const { staticPath } = options
    if (staticPath) this.staticPath = FS.join(FS.dir(options.root), staticPath)
  }

  protected async exec (request: IncomingMessage, response: ServerResponse) {
    const req = new Request(request)
    const res = new Response(response)
    if (req.url === '/favicon.ico') return
    const isEndpoint = this.router?.match(req.url)
    const staticPath = FS.absolute(this.staticPath + req.url)
    const isStatic = await FS.existsFile(staticPath)
    if (!isEndpoint && !isStatic) { return res.notFound() }
    if (!isEndpoint && isStatic) { return res.file(staticPath) }
    if (isEndpoint && !isStatic && !isEndpoint.handler[req.method]) { return res.methodNotAllowed() }

    if (!isEndpoint?.handler) {
      return res.notFound()
    }

    const { handler, regex } = isEndpoint

    if (!handler[req.method as Method]) {
      return res.methodNotAllowed()
    }

    req.match = new RegExp(regex, 'i')
    const action = handler[req.method as Method] as Action
    await action(req, res)
  }
}
