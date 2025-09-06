# Medical Chat Assistant Application

## Overview

This is a real-time medical chat application built with React, Express, and WebSockets. The application features a medicine sales agent (Dr. MediBot) that provides healthcare support to medical students through text and voice interactions. The system includes a modern UI with shadcn/ui components, real-time messaging capabilities, and audio recording functionality for enhanced user interaction.

## User Preferences

Preferred communication style: Simple, everyday language.
Authentication system: Phone number-based login with user-specific conversations.

## Demo Credentials for Testing

The application includes demo users for easy testing:
- **Demo User 1**: `+923001234567` (Dr. Ahmed Khan) - Has sample conversation
- **Demo User 2**: `+923009876543` (Medical Student Sara) - Fresh conversation

## Recent Changes

### Authentication System (Added: Sept 6, 2025)
- Added phone number authentication with medical theme
- User-specific chat conversations and message history
- Session management with localStorage persistence
- Logout functionality in chat header dropdown
- Protected routes requiring login
- Demo users and sample conversations for testing

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom medical-themed design tokens
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Audio Handling**: Native Web Audio API with MediaRecorder for voice messages

### Backend Architecture
- **Server Framework**: Express.js with TypeScript
- **Real-time Communication**: WebSocket server using the 'ws' library for instant messaging
- **File Upload**: Multer middleware for audio file handling with 10MB size limits
- **API Design**: RESTful endpoints with WebSocket integration for chat functionality
- **Storage Layer**: Abstract storage interface with in-memory implementation (MemStorage class)

### Database Schema
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Tables**: 
  - `messages`: Stores chat messages with support for text and audio content
  - `conversations`: Manages conversation sessions with student information
- **Schema Definition**: Shared TypeScript schemas with Zod validation using drizzle-zod

### Real-time Features
- **WebSocket Integration**: Bidirectional communication for instant message delivery
- **Audio Messages**: Complete audio workflow from recording to playback with waveform visualization
- **Connection Status**: Real-time connection monitoring with visual indicators
- **Message Persistence**: Messages stored with timestamps and conversation context

### UI/UX Design Patterns
- **Mobile-First Design**: Responsive layout optimized for mobile healthcare environments
- **Medical Theme**: Custom color palette with medical blues, greens, and teals
- **Accessibility**: Proper ARIA labels, keyboard navigation, and screen reader support
- **Touch-Friendly**: Large touch targets and optimized mobile interactions

## External Dependencies

### Core Framework Dependencies
- **React 18**: Frontend framework with hooks and concurrent features
- **Express.js**: Backend web server framework
- **TypeScript**: Type safety across the entire application stack
- **Vite**: Fast development and build tooling with HMR support

### Database & ORM
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver
- **drizzle-orm**: Type-safe ORM with PostgreSQL support
- **drizzle-kit**: Database migration and schema management tools

### UI & Styling
- **@radix-ui/**: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant API for component styling
- **lucide-react**: Consistent icon library

### Real-time & Communication
- **ws**: WebSocket library for real-time bidirectional communication
- **@tanstack/react-query**: Powerful data fetching and caching library

### Development Tools
- **@replit/vite-plugin-runtime-error-modal**: Enhanced error handling for Replit environment
- **@replit/vite-plugin-cartographer**: Development tooling for Replit integration
- **tsx**: TypeScript execution engine for development

### File Handling
- **multer**: Multipart form data handling for file uploads
- **connect-pg-simple**: PostgreSQL session store integration

### Validation & Utilities
- **zod**: Runtime type validation and schema definition
- **date-fns**: Modern date utility library
- **clsx & tailwind-merge**: Conditional CSS class management