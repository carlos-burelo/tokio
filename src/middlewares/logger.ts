import { IO } from '../logger.js'
import type { Req, Res } from '../types.js'

export async function BEFORE (req: Req, _: Res) {
  req.kv.set('tokio-start-time', Date.now())
}

export async function AFTER (req: Req, res: Res) {
  const start = req.kv.get<number>('tokio-start-time')
  const end = Date.now()
  const diff = end - start
  IO.print(`11~${req.method}~ 4~${req.url}~ 2~${res.code}~ 3~${diff}ms~`)
}
