require('dotenv').config();
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');

const app = require('./app');
const initSocket = require('./socket');

const PORT = process.env.PORT || 4444;
const mongoUrl = process.env.MONGO_URL;

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

initSocket(io); 

mongoose.connect(mongoUrl)
    .then(() => {
        server.listen(PORT, () => {
            console.log(`🟢 Server and DB running at http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('🔴 Cannot connect to DB', err.message);
    });
