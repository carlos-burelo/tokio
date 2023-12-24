import { IO } from './logger.js'

class TokioError extends Error {
  constructor (msg: string) {
    super(msg)
    this.stack = undefined
    this.name = 'TokioError'
    this.message = IO.parse(`9~${this.name}~: ${msg}`)
  }
}
export class InvalidContentTypeError extends TokioError {
  constructor (type: string) {
    super(`Invalid content-type in request: ${type}`)
  }
}

export class MissingDirectoriesError extends TokioError {
  constructor () {
    super('You must specify an api and/or public directory')
  }
}

export class NotFoundDirectoryError extends TokioError {
  constructor (dir: string) {
    super(`The directory ${dir} was not found`)
  }
}

export class InvalidContentLengthError extends TokioError {
  constructor () {
    super('Invalid content length')
  }
}

export class WriteFileError extends TokioError {
  constructor () {
    super('Error writing file')
  }
}
