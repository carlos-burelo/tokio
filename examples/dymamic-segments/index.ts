import { Tokio } from '../../src/index.js'

const server = new Tokio({ apiPath: 'api', port: 8002, root: import.meta.url })

await server.run(
  (host, port) => console.log(`[dynamic-segments] example running on port http://${host}:${port}`)
)
