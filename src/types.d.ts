import { type Request } from './request.ts'
import { type Response } from './response.ts'

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD'

export type Action = (req: Request, res: Response) => void | Promise<void>

export type Module = {
  [key in Method]?: Action
}
export interface Route {
  endpoint: () => Promise<Module>
  view?: string
}

export type RouterMap = Record<string, Module>
export interface TokioOptions {
  apiPath?: string
  staticPath?: string
  root: string
  port?: number
  host?: string
}

export type RunCallback = (host: string, port: string) => void
