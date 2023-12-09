import { Server } from 'node:http'
import { Router } from './router.js'
import { Controller } from './controller.js'

export class Tokio extends Controller {
  server: Server
  constructor (config: UserConfig) {
    super(config)
    this.server = new Server(this.exec.bind(this))
  }

  async run () {
    console.log(`Server running at http://localhost:${this.config.port}`)
    this.router = new Router(this.config.api, this.config.public)
    await this.router.read()
    this.server.listen(this.config.port)
  }
}

const server = new Tokio({ api: './ideas/api' })
await server.run()
