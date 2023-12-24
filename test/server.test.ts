import { describe, it } from 'node:test'
// import assert from 'node:assert'

import { Tokio } from '../src/server.js'

await describe('server', async () => {
  await it('should start server', async () => {
    const server = new Tokio({
      port: 8000,
      api: 'api'
    })
    await server.run()
    // assert.strictEqual(
    //   await fetch('http://localhost:8000').then(async res => await res.text()),
    //   'Hello World!'
    // )
  })
})
