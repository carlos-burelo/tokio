import { Tokio } from '../../src/index.js'

const server = new Tokio({ root: import.meta.url, apiPath: './api', port: 8001 })

await server.run(
  (host, port) => console.log(`[api-routes] example running on port http://${host}:${port}`)
)
