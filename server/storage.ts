import { type User, type InsertUser, type Message, type InsertMessage } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserBySocketId(socketId: string): Promise<User | undefined>;
  createUser(user: InsertUser & { socketId?: string }): Promise<User>;
  updateUserSocketId(userId: string, socketId: string | null): Promise<void>;
  deleteUser(id: string): Promise<void>;
  getAllActiveUsers(): Promise<User[]>;
  
  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getRecentMessages(limit?: number): Promise<Message[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private messages: Map<string, Message>;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserBySocketId(socketId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.socketId === socketId,
    );
  }

  async createUser(insertUser: InsertUser & { socketId?: string }): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      socketId: insertUser.socketId || null,
      joinedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserSocketId(userId: string, socketId: string | null): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.socketId = socketId;
      this.users.set(userId, user);
    }
  }

  async deleteUser(id: string): Promise<void> {
    this.users.delete(id);
  }

  async getAllActiveUsers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.socketId);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      timestamp: new Date()
    };
    this.messages.set(id, message);
    return message;
  }

  async getRecentMessages(limit: number = 50): Promise<Message[]> {
    const messages = Array.from(this.messages.values())
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .slice(-limit);
    return messages;
  }
}

export const storage = new MemStorage();
