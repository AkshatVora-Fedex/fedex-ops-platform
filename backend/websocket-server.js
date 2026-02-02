const http = require('http');
const socketIO = require('socket.io');

// Create HTTP server for WebSocket
const server = http.createServer();

const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('✅ WebSocket client connected:', socket.id);

  // Join AWB-specific room
  socket.on('join-awb', (awb) => {
    socket.join(awb);
    console.log(`📦 Client ${socket.id} joined AWB room: ${awb}`);
    
    // Send courier info when joining
    socket.emit('courier-info', {
      name: 'John Smith',
      id: 'C-1234',
      vehicle: 'V-5678',
      status: 'active'
    });
  });

  // Handle message sending
  socket.on('send-message', (message) => {
    console.log('📨 Broadcasting message to AWB room:', message.awb);
    // Broadcast to all clients in the AWB room
    io.to(message.awb).emit('message-received', message);
  });

  socket.on('disconnect', () => {
    console.log('❌ WebSocket client disconnected:', socket.id);
  });
});

// Start WebSocket server on port 5001
const PORT = 5001;
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║  FedEx WebSocket Server (Courier Comms)                ║
║  Running on port ${PORT}                               ║
║  Status: ✅ LIVE                                        ║
╚════════════════════════════════════════════════════════╝
  `);
});

module.exports = server;
