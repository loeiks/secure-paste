const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:6781',
        methods: ['GET', 'POST'],
    },
});

app.use(cors());

io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('publish_text', (text) => {
        io.emit('new_text', text);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = 7888;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
