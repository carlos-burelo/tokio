function createRouter (cases) {
  function createRegexPattern (path) {
    const segments = path.split('/').map(segment => {
      if (segment.startsWith('[') && segment.endsWith(']')) {
        return '([^/]+)'
      }
      return segment
    })

    return new RegExp(`^${segments.join('\\/')}$`)
  }

  function matchRoute (route, path) {
    const regex = createRegexPattern(route)
    const match = path.match(regex)
    return match ? match.slice(1) : null
  }

  function findMatchedRoute (path, routes) {
    for (const route of routes) {
      const match = matchRoute(route, path)
      if (match) {
        return { route, params: match }
      }
    }
    return null
  }

  function routeHandler (path) {
    const matchedRoute = findMatchedRoute(path, cases)

    if (matchedRoute) {
      console.log(`Matched route: ${matchedRoute.route}`)
      console.log('Matched parameters:', matchedRoute.params)
      // Aquí puedes agregar tu lógica para manejar la ruta
    } else {
      console.log('No matching route found')
      // Puedes manejar la ruta no coincidente aquí
    }
  }

  return routeHandler
}

// Resto del código sigue igual

const cases = [
  '/index.js',
  '/about.js',
  '/contact.js',
  '/blog/[slug].js',
  '/portfolio/[project].js',
  '/products/[category]/[id].js',
  '/products/[id].js',
  '/users/[username].js',
  '/posts/[slug].js',
  '/categories/[category].js',
  '/products/[category]/[id].js',
  '/[...catchAll].js',
  '/products/[...slug].js',
  '/categories/[...slug].js',
  '/blog/[...slug].js',
  '/[...catchAll]/info.js',
  '/[...catchAll]/[...extra].js',
  '/products.js',
  '/products/[id].js',
  '/products/[category]/[id].js',
  '/about.js',
  '/blog/[slug].js',
  '/contact.js'
]

const router = createRouter(cases)

// Prueba el enrutador con rutas
router('/about.js') // Debería coincidir con '/about.js'
router('/blog/my-post.js') // Debería coincidir con '/blog/[slug].js'
router('/products/electronics/123.js') // Debería coincidir con '/products/[category]/[id].js'
router('/non-existent-route.js') // Debería mostrar "No matching route found"
