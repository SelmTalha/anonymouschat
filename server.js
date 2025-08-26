const express = require('express');
const socket = require('socket.io');

const app = express();

// Render veya Heroku'nun PORT değişkenini kullan, yoksa 3000
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

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
