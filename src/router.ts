import { FSError } from './errors.js'
import { FS } from './files.js'
import type { Request } from './request.js'
import type { Response } from './response.js'
import type { Module, RouterMap } from './types.js'

export class Router {
  routes: RouterMap = {}
  #apiPath: string | undefined
  #staticPath: string | undefined
  constructor (apiPath: string | undefined, staticPath: string | undefined) {
    if (!apiPath && !staticPath) {
      throw new FSError()
    }
    if (apiPath) this.#apiPath = FS.absolute(apiPath)
    if (staticPath) this.#staticPath = FS.absolute(staticPath)
  }

  async init () {
    const [endpoints, statics] = await Promise.all([
      this.#apiPath ? FS.readDirRecursive(this.#apiPath) : [],
      this.#staticPath ? FS.readDirRecursive(this.#staticPath) : []
    ])
    if (this.#apiPath) {
      for (const endpoint of endpoints) {
        const regex = FS.toRegex(endpoint, this.#apiPath)
        this.routes[regex] = await this.#loader(endpoint)
      }
    }
    if (this.#staticPath) {
      for (const staticFile of statics.filter((ext) => ext.endsWith('.html'))) {
        const regex = FS.toRegex(staticFile, this.#staticPath)
        if (this.routes[regex]) {
          this.routes[regex] = this.replaceGet(this.routes[regex], staticFile)
        } else {
          this.routes[regex] = this.setGetter(staticFile)
        }
      }
    }
  }

  replaceGet (module: Module, file: string): Module {
    return {
      ...module,
      GET: async (_: Request, res: Response) => {
        await res.view(file)
      }
    }
  }

  setGetter (file: string) {
    return {
      GET: async (_: Request, res: Response) => {
        await res.view(file)
      }
    }
  }

  async #loader (path: string) {
    const modulePath = FS.url(path)
    return (await import(modulePath)) as Module
  }

  match (url: string) {
    for (const [regex, handler] of Object.entries(this.routes)) {
      const regexObject = new RegExp(regex, 'i')
      if (regexObject.test(url)) return { regex, handler }
    }
    return null
  }
}
