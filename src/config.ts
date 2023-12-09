import { MissingDirectoriesError, NotFoundDirectoryError } from './errors.js'
import { FileSystem } from './files.js'

export class Config implements TokioConfig {
  port: string | number
  host: string
  public?: string
  api?: string
  logs: boolean
  cors: string[]
  #ENV: NodeJS.ProcessEnv = process.env
  #PORT = 8000
  #HOST = 'http:localhost'

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

  #dir (dir: string) {
    const path = FileSystem.absolutePath(dir)
    if (!FileSystem.exists(path)) throw new NotFoundDirectoryError(dir)
    return path
  }
}
