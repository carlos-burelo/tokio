import { createReadStream, createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { WriteFileError } from './errors.js'
import type { TokioFile } from './types.js'

export class Files {
  static async save (file: TokioFile, dest: string) {
    try {
      const readStream = createReadStream(file.path)
      const writeStream = createWriteStream(dest)
      await pipeline(readStream, writeStream)
    } catch (error) {
      throw new WriteFileError()
    }
  }
}
