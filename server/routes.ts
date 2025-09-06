import type { Express, Request } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { insertMessageSchema, loginSchema } from "@shared/schema";
import { z } from "zod";

// Setup multer for audio file uploads
const uploadDir = path.join(process.cwd(), "uploads", "audio");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedMimes = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mp4'];
    cb(null, allowedMimes.includes(file.mimetype));
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Client connected to chat');

    // Send recent messages to newly connected client
    storage.getMessages(20).then(messages => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'initial_messages',
          messages
        }));
      }
    });

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'send_message') {
          // Save message to storage
          const newMessage = await storage.createMessage({
            content: message.content,
            sender: message.sender,
            messageType: message.messageType || 'text',
            audioUrl: message.audioUrl,
            audioDuration: message.audioDuration,
            isFromWebhook: false,
          });

          // Broadcast to all connected clients
          const broadcastData = JSON.stringify({
            type: 'new_message',
            message: newMessage
          });

          clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(broadcastData);
            }
          });

          // Send to n8n webhook if it's a user message
          if (message.sender === 'user') {
            try {
              const n8nWebhookUrl = process.env.N8N_OUTGOING_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL;
              if (n8nWebhookUrl) {
                await fetch(n8nWebhookUrl, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    message: newMessage.content,
                    messageType: newMessage.messageType,
                    audioUrl: newMessage.audioUrl,
                    timestamp: newMessage.timestamp,
                  }),
                });
              }
            } catch (error) {
              console.error('Failed to send to n8n webhook:', error);
            }
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      console.log('Client disconnected from chat');
    });
  });

  // Authentication routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { phoneNumber, name } = loginSchema.parse(req.body);
      
      // Check if user exists
      let user = await storage.getUserByPhone(phoneNumber);
      
      if (!user) {
        // Create new user
        user = await storage.createUser({
          phoneNumber,
          name: name || "Medical Student",
          isVerified: true, // Simple auth - no OTP for now
        });
      } else {
        // Update last login
        await storage.updateUserLogin(user.id);
      }

      // Create session (simple token)
      const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

      // Create default conversation if none exists
      let activeConv = await storage.getActiveConversationByUser(user.id);
      if (!activeConv) {
        activeConv = await storage.createConversation({
          userId: user.id,
          title: "Medical Consultation",
          status: "active",
        });
      }

      res.json({ 
        user, 
        token,
        conversationId: activeConv.id 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid request data', details: error.errors });
      } else {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
      }
    }
  });

  app.post('/api/auth/logout', async (req, res) => {
    try {
      // Simple logout - in real app would invalidate token
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Logout failed' });
    }
  });

  // REST API routes
  app.get('/api/messages/:conversationId?', async (req, res) => {
    try {
      const { conversationId } = req.params;
      let messages;
      
      if (conversationId) {
        messages = await storage.getMessagesByConversation(conversationId);
      } else {
        messages = await storage.getMessages();
      }
      
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  app.post('/api/messages', async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      
      // Broadcast to WebSocket clients
      const broadcastData = JSON.stringify({
        type: 'new_message',
        message
      });

      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(broadcastData);
        }
      });

      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid message data', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to create message' });
      }
    }
  });

  // Audio upload endpoint  
  app.post('/api/upload-audio', upload.single('audio'), async (req: Request & {file?: any}, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No audio file provided' });
      }

      const audioUrl = `/uploads/audio/${req.file.filename}`;
      res.json({ audioUrl });
    } catch (error) {
      res.status(500).json({ error: 'Failed to upload audio' });
    }
  });

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    // Add CORS headers for audio files
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    next();
  }, express.static(path.join(process.cwd(), 'uploads')));

  // n8n incoming webhook endpoint
  app.post('/api/webhook/n8n', async (req, res) => {
    try {
      const { message, messageType = 'text' } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message content required' });
      }

      const newMessage = await storage.createMessage({
        content: message,
        sender: 'agent',
        messageType,
        isFromWebhook: true,
      });

      // Broadcast to WebSocket clients
      const broadcastData = JSON.stringify({
        type: 'new_message',
        message: newMessage
      });

      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(broadcastData);
        }
      });

      res.json({ success: true, message: newMessage });
    } catch (error) {
      console.error('n8n webhook error:', error);
      res.status(500).json({ error: 'Failed to process webhook' });
    }
  });

  return httpServer;
}
