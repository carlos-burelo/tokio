import { statSync } from 'fs'
import { readFile, readdir, stat } from 'fs/promises'
import { dirname, join, resolve } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { ENTRY, EXT, PARAMS, SEGMENTS, SLASHES } from './constants.js'

export class FS {
  static dir (path: string) {
    return dirname(fileURLToPath(path))
  }

  static join (...paths: string[]) {
    return resolve(...paths)
  }

  static async readDir (dir: string) {
    return await readdir(dir, { withFileTypes: true })
  }

  static async readDirRecursive (dir: string, files: string[] = []) {
    for (const dirent of await FS.readDir(dir)) {
      const res = resolve(dir, dirent.name)
      if (dirent.isDirectory()) await FS.readDirRecursive(res, files)
      else files.push(res)
    }
    return files
  }

  static async existsFile (path: string) {
    try {
      const entry = await stat(resolve(path))
      return entry.isFile()
    } catch (error) {
      return false
    }
  }

  static existsDir (path: string | undefined) {
    try {
      if (!path) return false
      const entry = statSync(resolve(path))
      return entry.isDirectory()
    } catch (error) {
      return false
    }
  }

  static async readFile (filePath: string) {
    return await readFile(FS.absolute(filePath), 'utf-8')
  }

  static absolute (path: string) {
    return resolve(process.cwd(), path)
  }

  static relative (path: string) {
    return join(process.cwd(), path)
  }

  static url (path: string) {
    return pathToFileURL(FS.absolute(path)).href
  }

  static toRegex (path: string, base: string) {
    const regex = path
      .replace(base, '')
      .replace(SLASHES, '/')
      .replace(EXT, '')
      .replace(ENTRY, '/')
      .replace(SEGMENTS, PARAMS)
    return `^${regex}/?$`
  }
}
