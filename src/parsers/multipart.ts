import { writeFile } from 'node:fs/promises'
import { type IncomingMessage } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

class File implements TokioFile {
  constructor (
    public name: string,
    public path: string,
    public mimetype: string,
    public size: number) {}
}

export async function MultipartParser (body: Buffer, req: IncomingMessage) {
  const path = tmpdir()
  const { headers } = req
  const boundary = Buffer.from(`--${headers['content-type']?.split(';').pop()?.replace('boundary=', '').trim()}`)
  let begin = 0
  const parsedBody: Record<string, ValidData> = {}
  while (begin < body.length) {
    const end = body.indexOf(boundary, begin + boundary.length)
    if (end === -1) { break }
    const fieldStart = begin + boundary.length + 2
    const fieldEnd = body.indexOf(Buffer.from([0x0d, 0x0a]), fieldStart)
    const field = body.subarray(fieldStart, fieldEnd)
    const nameMatch = field.toString().match(/\bname=("([^"]*)"|([^()<>@,;:\\"/[\]?={}\s\t/]+))/i)
    const filenameMatch = field.toString().match(/\bfilename=("(.*?)"|([^()<>@,;:\\"/[\]?={}\s\t/]+))($|;\s)/i)
    if (!nameMatch) break
    if (!filenameMatch) {
      const valueStart = fieldEnd + 2 + 2
      const valueEnd = body.indexOf(Buffer.from([0x0d, 0x0a]), valueStart)
      const value = body.subarray(valueStart, valueEnd)
      parsedBody[nameMatch[2]] = value.toString()
    } else {
      const valueStart = body.indexOf(Buffer.from([0x0d, 0x0a]), fieldEnd + 2) + 2 + 2
      const valueEnd = body.indexOf(Buffer.from([0x0d, 0x0a]), valueStart)
      const value = body.subarray(valueStart, valueEnd)

      parsedBody[nameMatch[2]] = new File(
        filenameMatch[2],
        join(path, filenameMatch[2]),
        headers['content-type'] as string,
        value.length
      )
      await writeFile(join(path, filenameMatch[2]), value)
    }
    begin = end
  }
  return parsedBody
}
