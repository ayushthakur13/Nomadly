const Message = require('../models/message');
const User = require('../models/users');

module.exports = function(io) {
    io.on('connection', (socket) => {
        console.log('✅ New user connected');

        socket.on('joinRoom', ({ tripId }) => {
            socket.join(tripId);
            console.log(`🔗 Joined room ${tripId}`);
        });

        socket.on('sendMessage', async ({ tripId, userId, content }) => {
            try {
                const message = await Message.create({ trip: tripId, sender: userId, content });
                const sender = await User.findById(userId);

                io.to(tripId).emit('receiveMessage', {
                    _id: message._id,
                    trip: tripId,
                    sender: { _id: userId, name: sender.name }, 
                    content,
                    createdAt: message.createdAt
                });
            }
            catch (err) {
                console.error('💬 Error saving message:', err);
            }
        });

        socket.on('disconnect', () => {
            console.log('👋 User disconnected');
        });
    });
};
