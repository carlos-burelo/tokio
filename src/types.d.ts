import type { IncomingMessage, Server, ServerResponse } from 'node:http'

/**
 * Expression is a tuple of RegExp and string.
 * @example
 * ```typescript
 * const expression: Expression = [/\(\w+\)/g, ':$&'];
 * ```
 * @public
 */
export type Expression = [RegExp, string]

/**
 * HTTP methods.
 * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) for more information.
 * @example
 * ```typescript
 * const method: HttpMethod = 'GET';
 * ```
 * @public
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS' | 'CONNECT' | 'TRACE'

/**
   * @description Middleware methods.
   * @summary
   * | Method | Description |
   * |--------|:-------------|
   * | BEFORE | Runs before the route handler. |
   * | AFTER  | Runs after the route handler. |
   * @example
   *
   * #### _(ip-middleware).ts_
   *
   * ```typescript file=/(ip-logger).ts
   * export async function BEFORE(req: Req, res: Res) {
   *  req.headers.set('X-IP', req.ip)
   * }
   * export async function AFTER(req: Req, res: Res) {
   *  const ip = req.headers.get('X-IP')
   *  db.insert({ ip })
   * }
   * ```
   *
   * #### _index.ts_
   *
   * ```typescript file=/index.ts
   * export async function GET(req: Req, res: Res) {
   *  res.send(`Your IP is ${req.headers.get('X-IP')}`)
   * }
   * ```
   */
export type MiddlewareMethod = 'BEFORE' | 'AFTER'

/**
   * @param {Req} req - The request object.
   * @param {Res} res - The response object.
   *
   * @description
   * The handler function is the main function of the route.
   * It receives the request and response objects and returns a response.
   * @example
   * ```typescript
   * export async function GET(req: Req, res: Res) {
   *  return res.send('Hello World!')
   * }
   * ```
   */
export type Handler = (req: Req, res: Res) => Promise<any>

/**
 * Module containing HTTP methods mapped to their respective handlers.
 * @public
 */
export type Module = {
  [key in HttpMethod]?: Handler
}
/**
 * Middleware containing methods mapped to their respective handlers.
 * @public
 */
export type Middleware = {
  [key in MiddlewareMethod]?: Handler
}

/**
   * @description
   * The middlewares object contains the middleware name and the module.
   * ```
   * @public
   */
export type Middlewares = Record<string, Middleware>

/**
   * @description
   * The route object contains the module and middlewares.
   * ```
   * @public
   */
export interface Route {
  module?: Module
  middlewares?: Middlewares
}

/**
   * @description
   * The routes object contains the route name and the route object.
   * ```
   * @public
   */
export type Routes = Record<string, Route>

/**
   * @description
   * The match object contains the regex and the route object.
   * ```
   * @public
   */
export interface Match {
  regex: string
  route: Route
}

export interface Req {
  /** The request path.
     * @example /^/v1/users/(\d+)$/
    */
  regex: RegExp
  /**
     * The request path.
     * @example `/v1/users/1`
     */
  url: string
  /** The request method.
     * @example `GET` | `POST` | `PUT` | `DELETE` | `PATCH` | `HEAD` | `OPTIONS` | `CONNECT` | `TRACE`
    */
  method: HttpMethod
  /** The request headers.
     * @example { 'Content-Type': 'application/json' }
    */
  headers: Record<string, string>

  /** The request cookies.
     * @example { 'session': '123' }
    */
  cookie: string
  /** The request ip.
     * @example
     * `::1`
     */
  ip: string
  /** The request host.
     * @example `localhost:3000` | `example.com`
     */
  host: string
  /** The request origin.
     * @example `http://localhost:3000` | `https://example.com`
     */
  origin: string
  /** The request referer.
     * @example `http://localhost:3000` | `https://example.com`
     */
  referer: string
  /** The request user agent.
     * @example `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)`
     */
  userAgent: string
  /** The request content type.
     * @example `application/json`
     */
  contentType: string
  /** The volatile key-value store.
     * @example
     * ```typescript
     * const kv = _.kv
     * kv.set('test', 'value')
     * kv.get('test') // value
     * ```
     * **Note:** The kv store is volatile and is not persisted.\
     * It is only available during the request lifecycle.
     */
  get kv(): KVImpl
  /** The request params.
     * @example
     *
     * #### _/users/[id].ts_
     * ```typescript
     * // /users/1
     * export async function GET(req: Req, res: Res) {
     *  const { id } = req.params()
     *  res.json({ id }) // { id: '1'}
     * }
     * ```
     */
  params<T = string>(): Obj<T>
  /** The request segments.
     * @example
     *
     * #### _/product/[...segments].ts_
     * ```typescript
     * // /product/1/2/3
     * export async function GET(req: Req, res: Res) {
     *  const segments = req.segments()
     *  res.json({ segments }) //  ['1', '2', '3']
     * }
     * ```
     */
  segments(): string[]
  /** The request queries.
     * @example
     *
     * #### _/users.ts_
     * ```typescript
     * // /users?name=John&name=Jane
     * export async function GET(req: Req, res: Res) {
     *  const names = req.query('name')
     *  res.json(names) //  ['John', 'Jane']
     * }
     * ```
     */
  query(key: string): string[]
  /** The request queries.
     * @example
     *
     * #### _/users.ts_
     * ```typescript
     * // /users?name=John&lastname=Doe
     * export async function GET(req: Req, res: Res) {
     *  const queries = req.queries()
     *  res.json(queries) //  { name: 'John', lastname: 'Doe' }
     * }
     * ```
     */
  queries(): Obj
  /** The request body.
     * @example
     *
     * #### _/users.ts_
     * ```typescript
     * // /users
     * export async function POST(req: Req, res: Res) {
     *  const body = await req.body<'json'>()
     *  res.json(body) //  { name: 'John', lastname: 'Doe' }
     * }
     * ```
     */
  body<T extends BodyType = 'form'>(): Promise<BodyRequest[T]>
}

export interface Res {
  /** The response headers.
     * @example
     * ```typescript
     * res.headers.set('Content-Type', 'application/json')
     * res.headers.get('Content-Type') // application/json
     * ```
    */
  get headers(): HeaderImpl
  /** The response cookies.
     * @example
     * ```typescript
     * res.cookies.set('session', '123')
     * res.cookies.get('session') // 123
     * ```
    */
  get cookies(): CookieImpl
  /** The response status code.
     * @example
     * ```typescript
     * res.status(200)
     * ```
    */
  status(code: number): this
  /** The response status code.
     * @example
     * ```typescript
     * res.code// 200
     * ```
    */
  get code(): number
  /** The response status message.
     * @example
     * ```typescript
     * res.send('Hello World!') // 200 OK { Content-Type: text/plain }
     * ```
    */
  send(data: string | Buffer): void
  /** The response status message.
     * @example
     * ```typescript
     * res.sendResponse(200, 'Hello World!') // 200 OK { Content-Type: text/plain }
     * ```
    */
  sendResponse(code: number, data: string | Buffer): void
  /** The response status message.
     * @example
     * ```typescript
     * res.json({ message: 'Hello World!' }) // 200 OK { Content-Type: application/json }
     * ```
    */
  json(data: object): void
  /**
     *
     * @param url - The url to redirect to.
     * @example
     * ```typescript
     * res.redirect('/users') // 302 Found { Location: /users }
     * ```
     */
  redirect(url: string): void
  /**
     *
     * @param html - The html to send.
     * @example
     * ```typescript
     * res.html('<h1>Hello World!</h1>') // 200 OK { Content-Type: text/html }
     * ```
     */
  html(html: string): void
  /**
     *
     * @param text - The text to send.
     * @example
     * ```typescript
     * res.text('Hello World!') // 200 OK { Content-Type: text/plain }
     * ```
     */
  text(text: string): void
  /**
     *
     * @param data - The data to send.
     * @example
     * ```typescript
     * res.raw(Buffer.from('Hello World!')) // 200 OK { Content-Type: application/octet-stream }
     * // or
     * res.raw(fs.readFileSync('file.txt')) // 200 OK { Content-Type: application/octet-stream }
     * ```
     */
  raw(data: Buffer): void
  /**
     *
     * @param path - The file path to send.
     * @example
     * ```typescript
     * res.file('file.txt') // 200 OK { Content-Type: text/plain }
     * // or
     * res.file('file.json') // 200 OK { Content-Type: application/json }
     * ```
     */
  file(path: string): void
  /**
     *
     * @param path - The file path to send.
     * @example
     * ```typescript
     * res.view('index.html') // 200 OK { Content-Type: text/html }
     * ```
     */
  view(path: string): Promise<void>
  /**
     *
     * @param path - The file path to send.
     * @example
     * ```typescript
     * res.download('file.txt') // 200 OK { Content-Disposition: attachment; filename=file.txt }
     * ```
     */
  download(path: string): void
  /**
     *
     * @example
     * ```typescript
     * res.ok() // 200 OK
     * ```
     */
  ok(): void
  /**
     *
     * @example
     * ```typescript
     * res.created() // 201 Created
     * ```
     */
  created(): void
  /**
     *
     * @example
     * ```typescript
     * res.accepted() // 202 Accepted
     * ```
     */
  accepted(): void
  /**
     *
     * @example
     * ```typescript
     * res.noContent() // 204 No Content
     * ```
     */
  noContent(): void
  /**
     *
     * @example
     * ```typescript
     * res.badRequest() // 400 Bad Request
     * ```
     */
  badRequest(): void
  /**
     *
     * @example
     * ```typescript
     * res.unauthorized() // 401 Unauthorized
     * ```
     */
  unauthorized(): void
  /**
     *
     * @example
     * ```typescript
     * res.forbidden() // 403 Forbidden
     * ```
     */
  forbidden(): void
  /**
     *
     * @example
     * ```typescript
     * res.notFound() // 404 Not Found
     * ```
     */
  notFound(): void
  /**
     *
     * @example
     * ```typescript
     * res.methodNotAllowed() // 405 Method Not Allowed
     * ```
     */
  methodNotAllowed(): void
  /**
     *
     * @example
     * ```typescript
     * res.conflict() // 409 Conflict
     * ```
     */
  conflict(): void
  /**
     *
     * @example
     * ```typescript
     * res.internalServerError() // 500 Internal Server Error
     * ```
     */
  internalServerError(): void
  /**
     *
     * @example
     * ```typescript
     * res.notImplemented() // 501 Not Implemented
     * ```
     */
  notImplemented(): void
  /**
     *
     * @example
     * ```typescript
     * res.badGateway() // 502 Bad Gateway
     * ```
     */
  badGateway(): void
  /**
     *
     * @example
     * ```typescript
     * res.serviceUnavailable() // 503 Service Unavailable
     * ```
     */
  serviceUnavailable(): void
  /**
     *
     * @example
     * ```typescript
     * res.gatewayTimeout() // 504 Gateway Timeout
     * ```
     */
  gatewayTimeout(): void
  /**
     *
     * @example
     * ```typescript
     * res.networkAuthenticationRequired() // 511 Network Authentication Required
     * ```
     */
  networkAuthenticationRequired(): void
  /**
     *
     * @example
     * ```typescript
     * res.httpVersionNotSupported() // 505 HTTP Version Not Supported
     * ```
     */
  httpVersionNotSupported(): void
}
/**
   * @description
   * Object containing key-value pairs.
   */
export type Obj<T = string> = Record<string, T>
/**
   * Server constructor type from node:http.
   */
export type NodeServer = Server
/**
   * IncomingMessage constructor type from node:http.
   */
export type NodeRequest = IncomingMessage
/**
   * ServerResponse constructor type from node:http.
   */
export type NodeResponse = ServerResponse

/**
   * Body types supported by Tokio.
   * @public
   */
export type BodyType = keyof BodyRequest

/**
   * @example
   * ```typescript
   * const jsonBody = await req.body<'json'>()
   * const formBody = await req.body<'form'>()
   * const textBody = await req.body<'text'>()
   * const multipartBody = await req.body<'data'>()
   * ```
   * @public
   */
export interface BodyRequest {
  form: Record<string, string>
  json: Record<string, string>
  text: string
  data: Record<string, ValidData>
}

/**
   * A valid data type for the body.
   */
export type ValidData =
      | string
      | File
      | number
      | boolean
      | null
      | undefined
      | Record<string, any>

/**
   * Body parser interface.
   */
export interface BodyParser<ReturnType = unknown> {
  parse: () => Promise<ReturnType>
}

/**
   * Body parser constructor.
   */
export type ParserConstructor<T = unknown> = new (body: Buffer, req: NodeRequest) => BodyParser<T>

/**
   * File interface for the body in multipart/form-data.
   */
export interface TokioFile {
  name: string
  path: string
  mimetype: string
  size: number
}

/**
   * Config interface.
   * @example
   * ```typescript
   * const config: ConfigImpl = {
   *  port: import.meta.env.PORT || 3000,
   *  host: import.meta.env.HOST || 'localhost',
   *  public: import.meta.env.PUBLIC || 'public',
   *  api: import.meta.env.API || 'api',
   *  cors: ['*'],
   *  logs: true
   * }
   * ```
   */
export interface ConfigImpl {
  port: number | string
  host: string
  public?: string
  api?: string
  cors: string[]
  logs: boolean
}

/**
   * @example
   * ```typescript
   * const config: ConfigImpl = {
   *  port: import.meta.env.PORT || 3000,
   *  host: import.meta.env.HOST || 'localhost',
   *  public: import.meta.env.PUBLIC || 'public',
   *  api: import.meta.env.API || 'api',
   *  cors: ['*'],
   *  logs: true
   * }
   * ```
   */
export type UserConfig = Partial<ConfigImpl>

/**
   * @description
   * The router object contains the routes and the middlewares object.
   * @public
   */
export interface RouterImpl {
  /** Initializes the router. */
  init(): Promise<void>
  /**
     * Matches the url with the routes.
     * @param url - The url to match.
     * @example
     * ```typescript
     * const match = router.match('/v1/users/1')
     * ```
     */
  match(url: string): Match | null
}

/**
   * @description
   * The header object contains the set and get methods.
   * @public
   */
export interface HeaderImpl {
  /**
     * Sets a header.
     * @param key - The header key.
     * @param value - The header value.
     * @example
     * ```typescript
     * res.headers.set('Content-Type', 'application/json')
     * ```
     */
  set(key: string, value: string): void
  /**
     * Gets a header.
     * @param key - The header key.
     * @example
     * ```typescript
     * res.headers.get('Content-Type') // application/json
     * ```
     */
  get(key: string): string | string[] | number | undefined
}

/**
   * Cookie options interface.
   */
export interface CookieOptions {
  domain?: string
  expires?: Date
  httpOnly?: boolean
  maxAge?: number
  path?: string
  sameSite?: boolean | 'lax' | 'strict' | 'none'
  secure?: boolean
}

/**
   * @description
   * The cookie object contains the set and get methods.
   * @public
   */
export interface CookieImpl {
  /**
     * Sets a cookie.
     * @param key - The cookie key.
     * @param value - The cookie value.
     * @param options - The cookie options.
     * @example
     * ```typescript
     * res.cookies.set('session', '123')
     * ```
     * @example
     * ```typescript
     * res.cookies.set(
     * 'session',
     * '123',
     * {
     *  domain: 'example.com',
     *  expires: new Date(Date.now() + 900000),
     *  httpOnly: true,
     *  maxAge: 900000,
     *  path: '/',
     *  sameSite: 'lax',
     *  secure: true
     * })
      * ```
      */
  set(key: string, value: string, options?: CookieOptions): void
  /**
     * Gets a cookie.
     * @param key - The cookie key.
     * @example
     * ```typescript
     * res.cookies.get('session') // 123
     * ```
     */
  get(key: string): string | undefined
}

/**
   * @description
   * Tokio Server interface containing the server and run method.
   * @public
   */
export interface TokioImpl {
  server: Server
  /**
     * Starts the server.
     * @example
     * ```typescript
     * const server = new Tokio()
     * server.run()
     * ```
     */
  run: () => Promise<void>
}

/**
   * @description
   * Tokio Request interface containing the request object.
   * @public
   */
export interface BodyImpl {
  parse<T extends BodyType = 'form'>(): Promise<BodyRequest[T]>
}
/**
   * Key-value store interface.
   */
export interface KVImpl {
  /**
     * Sets a value.
     * @param key - The key.
     * @param value - The value.
     * @example
     * ```typescript
     * kv.set('test', 'value')
     * ```
     * **Note:** The kv store is volatile and is not persisted.\
     * It is only available during the request lifecycle.
     */
  set(key: string, value: unknown): void
  /**
     * Gets a value.
     * @param key - The key.
     * @example
     * ```typescript
     * kv.get('test') // value
     * ```
     * **Note:** The kv store is volatile and is not persisted.\
     * It is only available during the request lifecycle.
     */
  get<T = unknown>(key: string): T
}

export interface LoggerImpl {
  print(message: string): void
  /**
    * Parses a message with colors.
    * @param {string} message - The message to parse with colors.
    * @returns {string} The parsed message.
   */
  parseMessage(message: string): string
}

export type ColorCodes = Record<string, string>
