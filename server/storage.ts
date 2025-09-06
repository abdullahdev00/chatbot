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
    
    // Add demo users for testing
    this.createDemoUsers();
  }

  private createDemoUsers() {
    // Demo User 1
    const demoUser1: User = {
      id: "demo-user-1",
      phoneNumber: "+923001234567",
      name: "Dr. Ahmed Khan",
      isVerified: true,
      createdAt: new Date(),
      lastLogin: new Date(),
    };
    this.users.set(demoUser1.id, demoUser1);

    // Demo User 2
    const demoUser2: User = {
      id: "demo-user-2", 
      phoneNumber: "+923009876543",
      name: "Medical Student Sara",
      isVerified: true,
      createdAt: new Date(),
      lastLogin: new Date(),
    };
    this.users.set(demoUser2.id, demoUser2);

    // Create demo conversations
    const demoConv1: Conversation = {
      id: "demo-conv-1",
      userId: demoUser1.id,
      title: "Medication Inquiry",
      status: "active",
      createdAt: new Date(),
      lastMessageAt: new Date(),
    };
    this.conversations.set(demoConv1.id, demoConv1);

    const demoConv2: Conversation = {
      id: "demo-conv-2",
      userId: demoUser2.id,
      title: "Medical Consultation",
      status: "active", 
      createdAt: new Date(),
      lastMessageAt: new Date(),
    };
    this.conversations.set(demoConv2.id, demoConv2);

    // Add demo messages
    const demoMessage1: Message = {
      id: "demo-msg-1",
      conversationId: demoConv1.id,
      content: "Hello Dr. MediBot, I need information about antibiotics.",
      sender: "user",
      messageType: "text",
      audioUrl: null,
      audioDuration: null,
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      isFromWebhook: false,
    };
    this.messages.set(demoMessage1.id, demoMessage1);

    const demoMessage2: Message = {
      id: "demo-msg-2",
      conversationId: demoConv1.id,
      content: "Hello! I'm here to help with antibiotic information. What specific information do you need?",
      sender: "agent",
      messageType: "text",
      audioUrl: null,
      audioDuration: null,
      timestamp: new Date(Date.now() - 280000), // 4 min 40 sec ago
      isFromWebhook: true,
    };
    this.messages.set(demoMessage2.id, demoMessage2);
  }

  // User methods
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      name: insertUser.name || null,
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
      audioUrl: insertMessage.audioUrl || null,
      audioDuration: insertMessage.audioDuration || null,
      isFromWebhook: insertMessage.isFromWebhook || false,
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
      title: insertConversation.title || "New Conversation",
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
