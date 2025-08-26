const express = require('express');
const socket = require('socket.io');

const app = express();
const server = app.listen(3000, () => console.log('Server is running on port 3000'));
app.use(express.static('public'));

const io = socket(server);

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Kullanıcı odasına katılıyor
    socket.on('joinRoom', ({ username, room }) => {
        socket.username = username;
        socket.room = room;
        socket.join(room);
        console.log(`${username} joined room: ${room}`);

        socket.to(room).emit('chat', {
            sender: 'SYSTEM',
            message: `${username} odaya katıldı.`
        });
    });

    // Mesaj gönder
    socket.on('chat', (data) => {
        io.to(socket.room).emit('chat', {
            sender: socket.username,
            message: data.message
        });
    });

    // Typing bildir
    socket.on('typing', () => {
        socket.broadcast.to(socket.room).emit('typing', socket.username);
    });

    // Çıkış
    socket.on('disconnect', () => {
        if (socket.room) {
            socket.to(socket.room).emit('chat', {
                sender: 'SYSTEM',
                message: `${socket.username} odadan ayrıldı.`
            });
        }
    });
});
