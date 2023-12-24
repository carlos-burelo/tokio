import { writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { BodyParser, NodeRequest, ValidData, TokioFile } from '../types.js'

export class MultipartParser implements BodyParser<object> {
  private readonly boundaryRegex = /boundary=(?:"([^"]+)"|([^;]+))/i
  private readonly nameRegex = /\bname=("([^"]*)"|([^()<>@,;:\\"/[\]?={}\s\t/]+))/i
  private readonly filenameRegex = /\bfilename=("(.*?)"|([^()<>@,;:\\"/[\]?={}\s\t/]+))($|;\s)/i
  private readonly EOF = '\r\n\r\n'

  constructor (private readonly body: Buffer, private readonly req: NodeRequest) {}

  async parse (): Promise<object> {
    const boundary = this.getBoundary()
    if (!boundary) return {}
    const parsedBody = await this.parseFormData(boundary)
    return parsedBody
  }

  private getBoundary (): string | undefined {
    const contentType = this.req.headers['content-type']
    if (!contentType) return undefined
    const boundaryMatch = contentType.match(this.boundaryRegex)
    if (!boundaryMatch) return undefined
    return boundaryMatch[1] ?? boundaryMatch[2] ?? undefined
  }

  private async parseFormData (boundary: string): Promise<object> {
    const parsedBody: Record<string, ValidData> = {}
    const parts = this.body.toString().split(`--${boundary}`)
    await Promise.all(parts.map(async part => {
      const [partHeader, ...partBody] = part.split(this.EOF)
      const [nameMatch] = partHeader?.match(this.nameRegex) ?? []
      if (!nameMatch) return
      const fieldName = nameMatch[2] ?? nameMatch[3] ?? ''
      const filenameMatch = partHeader?.match(this.filenameRegex)
      if (filenameMatch) {
        const file = await this.parseFile(filenameMatch, partBody.join(this.EOF))
        parsedBody[fieldName] = file
      } else {
        const value = partBody.join(this.EOF).trim()
        parsedBody[fieldName] = value
      }
    }))
    return parsedBody
  }

  private async parseFile (filenameMatch: RegExpMatchArray, fieldValue: string): Promise<File> {
    const path = tmpdir()
    const filename = filenameMatch[2] ?? filenameMatch[3] ?? ''
    const filePath = join(path, filename)
    const contentType = this.req.headers['content-type']!
    const value = Buffer.from(fieldValue, 'binary')
    await writeFile(filePath, value)
    return new File(filename, filePath, contentType, value.length)
  }
}

class File implements TokioFile {
  constructor (public name: string, public path: string, public mimetype: string, public size: number) {}
}
