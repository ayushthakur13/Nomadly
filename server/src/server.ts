import dotenv from "dotenv";
import http from "http";
import mongoose from "mongoose";
import { Server as SocketIOServer } from "socket.io";
import app from "./app";
import initSocket from "./sockets/index";

dotenv.config();

const PORT = process.env.PORT || 4444;
const MONGO_URI = process.env.MONGO_URI || "";

// HTTP + Socket.io Server
const server = http.createServer(app);

const io = new SocketIOServer(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
    },
});

// Initialize socket handlers
initSocket(io);

// MongoDB Connection
mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("🟢 Connected to MongoDB");
        server.listen(PORT, () => {
            console.log(`⚡ Nomadly backend running on http://localhost:${PORT}`);
        });
    })
    .catch((err: Error) => {
        console.error("🔴 MongoDB connection failed:", err.message);
        process.exit(1);
    });

// Shutdown
process.on("SIGINT", async () => {
    await mongoose.connection.close();
    console.log("🟡 MongoDB connection closed. Shutting down gracefully...");
    process.exit(0);
});
