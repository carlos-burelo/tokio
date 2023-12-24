import { Config } from './config.js'
import { FileSystem } from './files.js'
import { TokioRequest } from './request.js'
import { Response } from './response.js'
import type { Router } from './router.js'
import middlewares from './middlewares/index.js'
import type { NodeRequest, NodeResponse, UserConfig, ConfigImpl } from './types.js'

export class Controller {
  protected config: ConfigImpl
  protected router: Router | undefined

  private readonly publicPath: string | undefined

  constructor (config: UserConfig) {
    this.config = new Config(config)
    if (this.config.public) this.publicPath = FileSystem.join(process.cwd(), this.config.public)
  }

  protected async exec (request: NodeRequest, response: NodeResponse) {
    const req = new TokioRequest(request, this.config)
    const res = new Response(response)

    try {
      if (req.url === '/favicon.ico') return

      const isEndpoint = this.router?.match(req.url)
      const staticPath = FileSystem.absolutePath(this.publicPath + req.url)
      const isStatic = FileSystem.exists(staticPath)

      if (!isEndpoint && !isStatic) {
        return res.notFound()
      } else if (!isEndpoint && isStatic) {
        return await res.file(staticPath)
      } else if (isEndpoint && !isStatic) {
        const { route, regex } = isEndpoint

        if (!route?.module?.[req.method]) {
          return res.methodNotAllowed()
        }

        await Promise.all(middlewares.map(async middleware => await middleware.BEFORE(req, res)))
        if (route.middlewares) {
          for (const middleware in route?.middlewares) {
            const { BEFORE } = route.middlewares[middleware]!
            await BEFORE?.(req, res)
          }
        }
        req.regex = new RegExp(regex, 'i')
        const handler = route.module[req.method]!
        await handler(req, res)

        if (route.middlewares) {
          for (const middleware in route?.middlewares) {
            const { AFTER } = route.middlewares[middleware]!
            await AFTER?.(req, res)
          }
        }
        await Promise.all(middlewares.map(async middleware => await middleware.AFTER(req, res)))
      }
    } catch (error) {
      console.error(error)
      res.internalServerError()
    }
  }
}
