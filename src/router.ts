import { readdir } from 'fs/promises'
import { resolve } from 'path'
import { pathToFileURL } from 'url'
import type { RouterImpl, Routes, Match, Expression } from './types.js'

export class Router implements RouterImpl {
  private readonly MIDDLEWARE_MATCH: Expression = [/\(.*\)/gi, '']
  private readonly EXTENSION_MATCH: Expression = [/\.[^/.]+$/i, '']
  private readonly INDEX_MATCH: Expression = [/\/index(?=\/|$)/i, '']
  private readonly SLASHES_MATCH: Expression = [/\\/g, '/']
  private readonly DYNAMIC_MATCH: Expression = [/\/\[(\w+)\]/g, '/(?<$1>[^/]+)']
  private readonly MULTIPLE_MATCH: Expression = [/\[\.{3}(\w+)\]/g, '(?<$1>.*)']

  private readonly routes: Routes = {}

  constructor (
    protected apiDir: string,
    protected publicDir?: string
  ) {
  }

  private async readRecursiveDir (dir: string): Promise<string[]> {
    const dirents = await readdir(dir, { withFileTypes: true, recursive: true })
    const files = dirents.filter(d => d.isFile())
    return files.map(file => resolve(file.path, file.name))
  }

  private buildRegexKey (path: string): string {
    let regex = path
      .replace(this.apiDir, '')
      .replace(this.EXTENSION_MATCH[0], this.EXTENSION_MATCH[1])
      .replace(this.SLASHES_MATCH[0], this.SLASHES_MATCH[1])
      .replace(this.INDEX_MATCH[0], this.INDEX_MATCH[1])
      .replace(this.DYNAMIC_MATCH[0], this.DYNAMIC_MATCH[1])
      .replace(this.MULTIPLE_MATCH[0], this.MULTIPLE_MATCH[1])
    regex = regex.endsWith('/') ? regex.slice(0, -1) : regex
    return `^${regex}/?$`
  }

  private async extractMiddlewares (path: string): Promise<Record<string, object>> {
    const middlewareObj: Record<string, object> = {}
    const segments = path.split('\\').filter(s => s !== '')
    await Promise.all(
      segments.map(async s => {
        const middleware = s.match(this.MIDDLEWARE_MATCH[0])
        if (middleware) {
          middlewareObj[middleware[0]] = { ...(await import(pathToFileURL(path).href)) }
        }
      })
    )
    return middlewareObj
  }

  public async init () {
    const paths = await this.readRecursiveDir(this.apiDir)
    for (const path of paths) {
      const middlewareMatch = path.match(this.MIDDLEWARE_MATCH[0])
      const isMiddleware = middlewareMatch && middlewareMatch.length > 0
      if (!isMiddleware) {
        const regexKey = this.buildRegexKey(path)
        if (!this.routes[regexKey]) {
          this.routes[regexKey] = {
            module: { ...(await import(pathToFileURL(path).href)) },
            middlewares: {}
          }
        }
        const middlewareObj = await this.extractMiddlewares(path)
        const existingMiddlewares = this.routes[regexKey]?.middlewares
        this.routes[regexKey]!.middlewares = { ...existingMiddlewares, ...middlewareObj }
        const sameLevelPaths = paths.filter(p => p !== path && p.startsWith(path.split('\\')[0]!))
        for (const samePath of sameLevelPaths) {
          const regexKeySame = this.buildRegexKey(samePath)
          if (this.routes[regexKeySame]?.middlewares) {
            this.routes[regexKey]!.middlewares = { ...this.routes[regexKey]?.middlewares, ...this.routes[regexKeySame]?.middlewares }
          }
        }
      } else {
        const routePath = path.replace(this.MIDDLEWARE_MATCH[0], '')
        const regexKey = this.buildRegexKey(routePath)
        const indexPath = path.replace(this.MIDDLEWARE_MATCH[0], 'index')
        if (!this.routes[regexKey]) {
          this.routes[regexKey] = {
            module: { ...(await import(pathToFileURL(indexPath).href)) },
            middlewares: {}
          }
        }
        const middlewareObj = await this.extractMiddlewares(path)
        const existingMiddlewares = this.routes[regexKey]?.middlewares
        this.routes[regexKey]!.middlewares = { ...existingMiddlewares, ...middlewareObj }
        const parentPath = routePath.split('/').slice(0, -1).join('/')
        const parentKey = this.buildRegexKey(parentPath)
        if (this.routes[parentKey]?.middlewares) {
          const parentMiddlewares = this.routes[parentKey]?.middlewares
          this.routes[regexKey]!.middlewares = { ...parentMiddlewares, ...this.routes[regexKey]?.middlewares }
        }
      }
    }
  }

  public match (url: string): Match | null {
    for (const [regex, route] of Object.entries(this.routes)) {
      const regexObject = new RegExp(regex, 'i')
      if (regexObject.test(url)) return { regex, route }
    }
    return null
  }
}
