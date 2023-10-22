export function GET(_, res) {
  return res.json({
    message: 'Hello, world!'
  })
}

export function POST(req, res) {
  const { name, age } = req.query()
  return res.json({
    message: `Hello, ${name}! You are ${age} years old.`
  })
}

// etc...
