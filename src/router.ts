import { FileSystem } from "./files.js";
import { Matcher } from "./matcher.js";

export class Router {
  #routes: Routes = {};

  constructor(protected apiDir?: string, protected publicDir?: string) {}

  async read() {
    const [endpoints, statics] = await Promise.all([
      this.apiDir ? FileSystem.readRecursiveDir(this.apiDir) : [],
      this.publicDir ? FileSystem.readRecursiveDir(this.publicDir) : [],
    ]);
    await Promise.allSettled([
      this.#process(endpoints, this.#addRoute.bind(this)),
      this.#process(statics, this.#addStatic.bind(this)),
    ]);
    this.#sort();
    return this;
  }

  async #process(files: string[], map: Fn) {
    return await Promise.all(files.map(map));
  }

  async #addRoute(path: string) {
    const key = Matcher.build(path, this.apiDir as string);
    const modulePath = FileSystem.toUrl(path);
    const module = await import(modulePath);
    this.#routes[key] = module;
  }

  async #addStatic(path: string) {
    const key = Matcher.build(path, this.publicDir as string);
    this.#addFile(key, path);
  }

  #addFile(key: string, path: string) {
    const module: Module = { GET: async (_, r) => r.file(path) };
    if (!this.#routes[key]) this.#routes[key] = module;
    else {
      this.#routes[key] = { ...this.#routes[key], ...module };
    }
  }

  #sort() {
    const sorted = Object.entries(this.#routes).sort(
      (a, b) => a[0].length - b[0].length
    );
    this.#routes = Object.fromEntries(sorted);
  }

  match(url: string) {
    for (const [regex, module] of Object.entries(this.#routes)) {
      const regexObject = new RegExp(regex, "i");
      if (regexObject.test(url)) return { regex, module };
    }
    return null;
  }
}
