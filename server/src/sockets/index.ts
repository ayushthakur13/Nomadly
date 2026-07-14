import { Server, Socket } from "socket.io";
import Message from "../modules/trips/chat/message.model";
import User from "../modules/users/user.model";
import Trip from "../modules/trips/core/trip.model";
import { isTripCreator, isTripMember } from "../modules/trips/members/member.utils";
import { verifyAccessToken } from "../modules/auth/utils/jwt";

interface JoinRoomPayload {
  tripId: string;
}

interface SendMessagePayload {
  tripId: string;
  content: string;
}

export default function initSocket(io: Server): void {
  // Authentication middleware for incoming WebSocket connection handshakes
  io.use((socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token || typeof token !== "string") {
        return next(new Error("Authentication error: Missing token"));
      }

      const payload = verifyAccessToken(token);
      socket.data.user = {
        id: payload.sub,
        username: payload.username,
        email: payload.email,
        isAdmin: payload.isAdmin || false,
      };
      
      next();
    } catch (err: any) {
      return next(new Error(`Authentication error: ${err.message || "Invalid token"}`));
    }
  });

  io.on("connection", (socket: Socket) => {
    console.log("✅ New authenticated client connected:", socket.id, "User:", socket.data.user?.username);

    // Join Trip Room
    socket.on("joinRoom", async ({ tripId }: JoinRoomPayload) => {
      const userId = socket.data.user?.id;
      if (!userId) {
        socket.emit("error", { message: "Authentication error" });
        return;
      }

      try {
        const trip = await Trip.findById(tripId).lean();
        if (!trip) {
          socket.emit("error", { message: "Trip not found" });
          return;
        }

        // Room-snooping guard: Check if user is creator or member
        if (!isTripCreator(trip, userId) && !isTripMember(trip, userId)) {
          socket.emit("error", { message: "Unauthorized to join this room" });
          return;
        }

        socket.join(tripId);
        console.log(`🔗 User ${socket.data.user.username} (${socket.id}) joined trip room: ${tripId}`);
      } catch (err) {
        console.error("🚨 Socket join room error:", err);
        socket.emit("error", { message: "Failed to join chat room" });
      }
    });

    // Send Message
    socket.on("sendMessage", async ({ tripId, content }: SendMessagePayload) => {
      const userId = socket.data.user?.id;
      if (!userId) {
        socket.emit("error", { message: "Authentication error" });
        return;
      }

      if (!content || typeof content !== "string" || content.trim() === "") {
        socket.emit("error", { message: "Message content is required" });
        return;
      }

      // Enforce message length constraint
      if (content.length > 2000) {
        socket.emit("error", { message: "Message exceeds 2000 characters" });
        return;
      }

      try {
        const trip = await Trip.findById(tripId).lean();
        if (!trip) {
          socket.emit("error", { message: "Trip not found" });
          return;
        }

        // Room-snooping guard: Check if user is creator or member
        if (!isTripCreator(trip, userId) && !isTripMember(trip, userId)) {
          socket.emit("error", { message: "Unauthorized to send messages to this trip" });
          return;
        }

        // Save to DB
        const message = await Message.create({
          trip: tripId,
          sender: userId,
          content: content.trim(),
        });

        // Get sender profile details
        const sender = await User.findById(userId).select("username profilePicUrl").lean();

        // Broadcast to room
        io.to(tripId).emit("receiveMessage", {
          _id: message._id,
          trip: tripId,
          sender: {
            _id: userId,
            username: sender?.username || "Unknown User",
            profilePicUrl: sender?.profilePicUrl || null,
          },
          content: content.trim(),
          createdAt: message.createdAt,
        });

        console.log(`💬 Message sent in trip ${tripId} by ${sender?.username}`);
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
