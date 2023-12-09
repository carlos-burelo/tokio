import { readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export class FileSystem {
  static absolutePath (path: string) {
    return resolve(process.cwd(), path)
  }

  static join (...paths: string[]) {
    return resolve(...paths)
  }

  static directory (path: string) {
    return dirname(fileURLToPath(path))
  }

  static exists (dir: string) {
    return existsSync(dir)
  }

  static toUrl (path: string) {
    return pathToFileURL(path).href
  }

  static async readDir (absoluteDir: string) {
    return await readdir(absoluteDir, { withFileTypes: true })
  }

  static async readRecursiveDir (absoluteDir: string, options?: RecursiveDirOptions, FILES: string[] = []) {
    // ignore interceptors: (filename).someext or (folder)/filename.ext
    const defaultOptions = { ignore: [/\(\w+\)/gi] }
    options = { ...defaultOptions, ...options }
    for (const dirent of await FileSystem.readDir(absoluteDir)) {
      const path = resolve(absoluteDir, dirent.name)
      if (dirent.isDirectory()) await FileSystem.readRecursiveDir(path, options, FILES)
      else {
        const ignore = options?.ignore?.some(regex => regex.test(path))
        if (!ignore) FILES.push(path)
      }
    }
    return FILES
  }
}
