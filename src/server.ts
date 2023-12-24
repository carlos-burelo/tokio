import { Server } from 'node:http'
import { Controller } from './controller.js'
import { IO } from './logger.js'
import { Router } from './router.js'
import type { TokioImpl, UserConfig } from './types.js'

export class Tokio extends Controller implements TokioImpl {
  server: Server
  constructor (config: UserConfig) {
    super(config)
    this.server = new Server(this.exec.bind(this))
  }

  async run () {
    IO.print(`Server running at 4~${this.config.host}:${this.config.port}~ 🚀`)
    this.router = new Router(this.config.api!, this.config.public)
    await this.router.init()
    this.server.listen(this.config.port)
  }
}
