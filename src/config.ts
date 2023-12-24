import { MissingDirectoriesError, NotFoundDirectoryError } from './errors.js'
import { FileSystem } from './files.js'
import type { ConfigImpl, UserConfig } from './types.js'

export class Config implements ConfigImpl {
  port: string | number
  host: string
  public?: string
  api?: string
  logs: boolean
  cors: string[]
  fileMaxSize: number = 1024

  readonly #ENV: NodeJS.ProcessEnv = process.env
  readonly #PORT = 8000
  readonly #HOST = 'http://localhost'

  constructor (config: UserConfig) {
    const { port, host, api: apiDir, public: publicDir } = config
    const { HOST = host ?? this.#HOST, PORT = port ?? this.#PORT } = this.#ENV
    if (!apiDir && !publicDir) throw new MissingDirectoriesError()
    this.port = Number(PORT)
    this.host = HOST
    this.public = publicDir ? this.#dir(publicDir) : undefined
    this.api = apiDir ? this.#dir(apiDir) : undefined
    this.logs = config.logs ?? true
    this.cors = config.cors ?? []
  }

  #dir (dir?: string) {
    if (!dir) return
    const path = FileSystem.absolutePath(dir)
    if (!FileSystem.exists(path)) throw new NotFoundDirectoryError(dir)
    return path
  }
}
