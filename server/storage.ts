import { type User, type InsertUser, type Message, type InsertMessage, type Conversation, type InsertConversation } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  createUser(user: InsertUser): Promise<User>;
  getUserByPhone(phoneNumber: string): Promise<User | undefined>;
  updateUserLogin(userId: string): Promise<void>;
  
  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(limit?: number): Promise<Message[]>;
  getMessagesByConversation(conversationId: string): Promise<Message[]>;
  
  // Conversations
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversationsByUser(userId: string): Promise<Conversation[]>;
  getActiveConversationByUser(userId: string): Promise<Conversation | undefined>;
  updateConversationLastMessage(conversationId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private messages: Map<string, Message>;
  private conversations: Map<string, Conversation>;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.conversations = new Map();
  }

  // User methods
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      isVerified: insertUser.isVerified || false,
      createdAt: new Date(),
      lastLogin: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getUserByPhone(phoneNumber: string): Promise<User | undefined> {
    return Array.from(this.users.values())
      .find(user => user.phoneNumber === phoneNumber);
  }

  async updateUserLogin(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.lastLogin = new Date();
      this.users.set(userId, user);
    }
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      messageType: insertMessage.messageType || "text",
      timestamp: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessages(limit: number = 50): Promise<Message[]> {
    const allMessages = Array.from(this.messages.values())
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    return allMessages.slice(-limit);
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.conversationId === conversationId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const conversation: Conversation = {
      ...insertConversation,
      id,
      status: insertConversation.status || "active",
      createdAt: new Date(),
      lastMessageAt: new Date(),
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async getConversationsByUser(userId: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .filter(conv => conv.userId === userId)
      .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
  }

  async getActiveConversationByUser(userId: string): Promise<Conversation | undefined> {
    return Array.from(this.conversations.values())
      .find(conv => conv.userId === userId && conv.status === "active");
  }

  async updateConversationLastMessage(conversationId: string): Promise<void> {
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.lastMessageAt = new Date();
      this.conversations.set(conversationId, conversation);
    }
  }
}

export const storage = new MemStorage();
