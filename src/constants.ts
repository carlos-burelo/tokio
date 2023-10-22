export const EXT = /\.(ts|js|html)$/i
export const ENTRY = /\/index$/i
export const SLASHES = /\\/g
export const SEGMENTS = /\/\[(\w+)\]/g
export const PARAMS = (_: string, p: string) => `/(?<${p}>[^/$]+?)`
export const HOST = process.env.HOST ?? 'http://localhost'
export const PORT = process.env.PORT ?? 3000
