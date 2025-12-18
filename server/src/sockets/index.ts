import { Server, Socket } from "socket.io";
import Message from "../models/message.model";
import User from "../models/user.model";

interface JoinRoomPayload {
  tripId: string;
}

interface SendMessagePayload {
  tripId: string;
  userId: string;
  content: string;
}

export default function initSocket(io: Server): void {
  io.on("connection", (socket: Socket) => {
    console.log("✅ New client connected:", socket.id);

    // Join Trip Room
    socket.on("joinRoom", ({ tripId }: JoinRoomPayload) => {
      socket.join(tripId);
      console.log(`🔗 User ${socket.id} joined trip room: ${tripId}`);
    });

    // Send Message
    socket.on("sendMessage", async ({ tripId, userId, content }: SendMessagePayload) => {
      try {
        const message = await Message.create({
          trip: tripId,
          sender: userId,
          content,
        });

        const sender = await User.findById(userId).select("name");

        io.to(tripId).emit("receiveMessage", {
          _id: message._id,
          trip: tripId,
          sender: {
            _id: userId,
            name: sender?.name || "Unknown User",
          },
          content,
          createdAt: message.createdAt,
        });

        console.log(`💬 Message sent in trip ${tripId} by ${sender?.name}`);
      } catch (err) {
        console.error("🚨 Error saving message:", err);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log("👋 Client disconnected:", socket.id);
    });
  });
}
