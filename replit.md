# Replit.md

## Overview

This is a real-time chat application built with React, TypeScript, and Express.js. The application provides a collaborative chat room where users can join with a username, send messages, and see who's currently online. It features real-time messaging through Socket.IO, a modern UI built with shadcn/ui components, and supports responsive design for both desktop and mobile devices.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: React hooks for local state, TanStack React Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Communication**: Socket.IO client for WebSocket connections

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Real-time Communication**: Socket.IO server for WebSocket connections
- **Data Storage**: In-memory storage implementation with interface for future database integration
- **Development Setup**: Hot module replacement with Vite middleware integration
- **Build Process**: ESBuild for server bundling, Vite for client bundling

### Data Storage Design
- **Storage Interface**: Abstract IStorage interface supporting both user and message operations
- **Current Implementation**: MemStorage class using in-memory Maps for development
- **Database Schema**: Drizzle ORM schema defined for PostgreSQL with users and messages tables
- **Migration Ready**: Drizzle configuration prepared for database migration when needed

### Authentication and User Management
- **Session Management**: Socket-based user sessions without persistent authentication
- **User Identification**: Username-based identification with unique socket IDs
- **User State**: Real-time tracking of active users and their connection status

### Real-time Features
- **Message Broadcasting**: Instant message delivery to all connected clients
- **User Presence**: Live user list with join/leave notifications
- **Typing Indicators**: Real-time typing status display
- **Connection Management**: Automatic cleanup of disconnected users

### API Structure
- **REST Endpoints**: `/api/messages` for message history, `/api/users` for active users
- **WebSocket Events**: Custom Socket.IO events for join, message, typing, and user updates
- **Error Handling**: Centralized error handling with proper HTTP status codes

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, TypeScript support
- **Build Tools**: Vite for development server and building, ESBuild for server bundling
- **Development**: tsx for TypeScript execution, Replit-specific plugins

### UI and Styling
- **Component Library**: Complete shadcn/ui component set with Radix UI primitives
- **Styling**: Tailwind CSS with PostCSS and Autoprefixer
- **Icons**: Lucide React icon library
- **Utilities**: clsx and tailwind-merge for conditional styling

### Real-time Communication
- **WebSocket**: Socket.IO for both client and server real-time communication
- **State Management**: TanStack React Query for server state synchronization

### Database and ORM (Prepared)
- **ORM**: Drizzle ORM with Drizzle Kit for migrations
- **Database Driver**: Neon Database serverless PostgreSQL driver
- **Validation**: Drizzle Zod integration for schema validation

### Utility Libraries
- **Date Handling**: date-fns for date formatting and manipulation
- **Form Handling**: React Hook Form with Hookform resolvers
- **Routing**: Wouter for lightweight client-side routing
- **Session Storage**: connect-pg-simple for future PostgreSQL session storage

### Development and Deployment
- **Type Safety**: Full TypeScript support across client, server, and shared code
- **Hot Reload**: Vite HMR integration with Express server
- **Error Handling**: Runtime error overlay for development debugging
- **Environment**: Replit-optimized development environment with banner integration