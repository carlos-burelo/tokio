import assert from 'node:assert'
import { describe, it } from 'node:test'
import { IO } from '../src/logger.js'

await describe('Logger expected', async () => {
  await it('should parse message with colors', async () => {
    assert.strictEqual(IO.parse('11~GET~'), '\x1B[31m\x1B[41mGET\x1B[0m')
    assert.strictEqual(IO.parse('12~POST~'), '\x1B[31m\x1B[42mPOST\x1B[0m')
    assert.strictEqual(IO.parse('13~PUT~'), '\x1B[31m\x1B[43mPUT\x1B[0m')
    assert.strictEqual(IO.parse('14~PATCH~'), '\x1B[31m\x1B[44mPATCH\x1B[0m')
  })
})
