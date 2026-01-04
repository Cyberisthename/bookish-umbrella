const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const port = 3000
const hostname = '127.0.0.1'

// In production, we need to use the standalone build
const dev = false
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  server.listen(port, hostname, () => {
    console.log(`Paralegal AI Assistant server running at http://${hostname}:${port}`)
  })
})
