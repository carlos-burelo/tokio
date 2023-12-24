import cluster from 'node:cluster'
import { cpus } from 'node:os'
import { Tokio } from './server.js'
import type { UserConfig } from './types.js'
import { IO } from './logger.js'

export class TokioWithClusters extends Tokio {
  protected workers: number = cpus().length
  constructor (config: UserConfig) {
    super(config)
  }

  async run () {
    if (cluster.isPrimary) {
      for (let i = 0; i < this.workers; i++) cluster.fork()
      cluster.on('exit', w => IO.print(`1~worker ${w.process.pid} died~`))
    } else {
      await this.run()
    }
  }
}
