import { Tokio } from '../../src/core/index.js'

const server = new Tokio({ root: import.meta.url, staticPath: './public', port: 8003 })

await server.run(
  (host, port) => console.log(`[static-files] example running on port http://${host}:${port}`)
)
