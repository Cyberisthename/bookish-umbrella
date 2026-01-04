const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const port = 3000
const hostname = '127.0.0.1'

const app = next({ dev: false, port })

const handleRequest = async (req, res) => {
  try {
    await app.render(req, res)
  } catch (err) {
    console.error('Error rendering request:', err)
    res.statusCode = 500
    res.end('Internal Server Error')
  }
}

const server = createServer(handleRequest)

server.listen(port, hostname, () => {
  console.log(`Paralegal AI Assistant server running at http://${hostname}:${port}`)
})
