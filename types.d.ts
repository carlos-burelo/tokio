import { type IncomingMessage } from 'node:http'

export declare global {
  export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

  interface BodyRequest {
    form: Record<string, string>
    json: Record<string, string>
    text: string
    data: Record<string, ValidData>
  }
  type ValidData = string | File | number | boolean | null | undefined | Record<string, any>
   type BodyType = keyof BodyRequest

   interface TokioFile {
     name: string
     path: string
     mimetype: string
     size: number
   }

   export interface Request {
     url: string
     method: Method
     headers: Record<string, string>
     body: any
   }

   interface Response {
     status: number
     headers: Record<string, string>
     body: any
     json: (body: any) => void
   }

   type BodyParser = (body: Buffer, req: IncomingMessage) => Promise<unknown>

   export type Obj<T = string> = Record<string, T>

   export type Handler = (req: any, res: any) => void | Promise<void>

   export type Module = {
     [key in Method]?: Handler
   }

   export type Fn = (i: string) => void

   export type Routes = Record<string, Module>

   export interface TokioConfig {
     port: number | string
     host: string
     public?: string
     api?: string
     cors: string[]
     logs: boolean
   }

   export type UserConfig = Partial<TokioConfig>

   export interface RecursiveDirOptions {
     ignore?: RegExp[]
   }

}
