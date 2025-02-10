const socketIo = require('socket.io');
const Event = require('../models/eventModel');

const startSocketServer = (server) => {
    const io = socketIo(server);

    io.on('connection', (socket) => {
        console.log('User connected');

        socket.on('join-event', (eventId) => {
            socket.join(eventId);
            console.log(`User joined event: ${eventId}`);

            // Emit real-time attendees list when someone joins
            Event.findById(eventId, (err, event) => {
                if (event) {
                    io.to(eventId).emit('attendees-update', event.members);
                }
            });
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });

    return io;
};

module.exports = startSocketServer;
