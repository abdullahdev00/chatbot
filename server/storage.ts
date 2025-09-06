import { type Message, type InsertMessage, type Conversation, type InsertConversation } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(limit?: number): Promise<Message[]>;
  getMessagesByConversation(conversationId: string): Promise<Message[]>;
  
  // Conversations
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getActiveConversation(): Promise<Conversation | undefined>;
  updateConversationLastMessage(conversationId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private messages: Map<string, Message>;
  private conversations: Map<string, Conversation>;

  constructor() {
    this.messages = new Map();
    this.conversations = new Map();
    
    // Create default active conversation
    const defaultConversation: Conversation = {
      id: randomUUID(),
      studentName: "Medical Student",
      status: "active",
      createdAt: new Date(),
      lastMessageAt: new Date(),
    };
    this.conversations.set(defaultConversation.id, defaultConversation);
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
    // For simplicity, return all messages since we have one active conversation
    return this.getMessages();
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

  async getActiveConversation(): Promise<Conversation | undefined> {
    return Array.from(this.conversations.values())
      .find(conv => conv.status === "active");
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
