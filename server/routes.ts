import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";
import { insertUserSchema, insertMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getRecentMessages(50);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllActiveUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  const httpServer = createServer(app);

  // Socket.io setup
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === "development" ? true : false,
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Handle user joining
    socket.on("join", async (data: { username: string }) => {
      try {
        const { username } = data;
        
        // Validate username
        const parseResult = insertUserSchema.safeParse({ username });
        if (!parseResult.success) {
          socket.emit("error", { message: "Invalid username" });
          return;
        }

        // Check if username is already taken
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser && existingUser.socketId) {
          socket.emit("error", { message: "Username already taken" });
          return;
        }

        // Create or update user
        let user;
        if (existingUser) {
          await storage.updateUserSocketId(existingUser.id, socket.id);
          user = await storage.getUser(existingUser.id);
        } else {
          user = await storage.createUser({ username, socketId: socket.id });
        }

        socket.data.userId = user!.id;
        socket.data.username = username;

        // Join user to chat room
        socket.join("chat");

        // Send user info back
        socket.emit("joined", { user: user! });

        // Send recent messages
        const messages = await storage.getRecentMessages(50);
        socket.emit("message_history", messages);

        // Broadcast user joined
        socket.to("chat").emit("user_joined", { username });

        // Send updated user list to all clients
        const activeUsers = await storage.getAllActiveUsers();
        io.to("chat").emit("users_updated", activeUsers);

      } catch (error) {
        console.error("Error handling join:", error);
        socket.emit("error", { message: "Failed to join chat" });
      }
    });

    // Handle new messages
    socket.on("send_message", async (data: { content: string }) => {
      try {
        if (!socket.data.userId || !socket.data.username) {
          socket.emit("error", { message: "Not authenticated" });
          return;
        }

        const { content } = data;
        
        // Validate message
        const parseResult = insertMessageSchema.safeParse({
          content,
          username: socket.data.username,
          userId: socket.data.userId
        });

        if (!parseResult.success) {
          socket.emit("error", { message: "Invalid message" });
          return;
        }

        // Create message
        const message = await storage.createMessage(parseResult.data);

        // Broadcast message to all users in chat
        io.to("chat").emit("new_message", message);

      } catch (error) {
        console.error("Error handling message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle typing indicators
    socket.on("typing_start", () => {
      if (socket.data.username) {
        socket.to("chat").emit("user_typing", { username: socket.data.username, isTyping: true });
      }
    });

    socket.on("typing_stop", () => {
      if (socket.data.username) {
        socket.to("chat").emit("user_typing", { username: socket.data.username, isTyping: false });
      }
    });

    // Handle disconnection
    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.id);
      
      try {
        if (socket.data.userId) {
          const user = await storage.getUserBySocketId(socket.id);
          if (user) {
            await storage.updateUserSocketId(user.id, null);
            
            // Broadcast user left
            socket.to("chat").emit("user_left", { username: user.username });
            
            // Send updated user list
            const activeUsers = await storage.getAllActiveUsers();
            io.to("chat").emit("users_updated", activeUsers);
          }
        }
      } catch (error) {
        console.error("Error handling disconnect:", error);
      }
    });
  });

  return httpServer;
}
