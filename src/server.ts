import { Server } from 'http'
import { FSError } from './errors.js'
import { FS } from './files.js'
import { Handler } from './handler.js'
import { Router } from './router.js'
import { type RunCallback, type TokioOptions } from './types.js'

const DEFAULS: TokioOptions = {
  host: 'localhost',
  port: 8000,
  root: './'
}

export class Tokio extends Handler {
  #server: Server
  #apiPath: string | undefined
  #staticPath: string | undefined
  #options: Required<TokioOptions>
  constructor (protected options: TokioOptions) {
    super({ ...DEFAULS, ...options })
    const opts = { ...DEFAULS, ...options }
    this.#options = opts as Required<TokioOptions>
    const { apiPath, staticPath } = this.#options
    if ((apiPath === '') && (staticPath === '')) throw new FSError()
    if (apiPath) this.#apiPath = FS.join(FS.dir(options.root), apiPath)
    if (staticPath) {
      this.#staticPath = FS.join(FS.dir(options.root), staticPath)
    }
    this.#server = new Server(super.exec.bind(this))
  }

  async run (f?: RunCallback) {
    const router = new Router(this.#apiPath, this.#staticPath)
    await router.init()
    this.router = router
    this.#server.listen(this.options.port, () => {
      if (f) {
        f(this.#options.host, this.#options.port.toString())
      } else {
        console.log(
          `Server listening on port http://localhost:${this.options.port}`
        )
      }
    })
  }

  get server (): Server {
    return this.#server
  }
}
