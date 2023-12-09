import { Tokio } from '../../src/core/server.js'
import { Server } from 'socket.io'

const app = new Tokio({ root: import.meta.url, staticPath: './public', port: 8004 })

const io = new Server(app.server)

io.on('connection', (socket) => {
  console.log('a user connected')
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
  socket.on('ping', () => {
    socket.emit('pong', 'pong') // Cambié io.emit a socket.emit para responder al cliente que envió el ping.
  })
})

await app.run((host, port) => {
  console.log(`[websocket-server] example running on port http://${host}:${port}`)
})
