export function GET (req, res) {
  const { user } = req.params()
  return res.html(`<h1>Hello ${user}</h1>`)
}
