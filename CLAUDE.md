# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ZettaSource is a Next.js 13.5 application with TypeScript that appears to be a project management system for hardware/embedded development with integrated RAG (Retrieval-Augmented Generation) capabilities. The app uses Zustand for state management, Supabase for vector storage, and LangChain for AI/chat functionality.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## Architecture

### Tech Stack
- **Framework**: Next.js 13.5 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom UI component library (shadcn/ui)
- **State Management**: Zustand with persistence
- **AI/Chat**: LangChain, OpenAI, Vercel AI SDK
- **Vector Store**: Supabase with OpenAI embeddings
- **UI Components**: Radix UI primitives with custom styling

### Project Structure

- `/app` - Next.js App Router pages and API routes
  - `/api/chat` - Chat API endpoints with RAG capabilities
  - `/api/retrieval` - Document ingestion and retrieval endpoints
  - `/projects` - Project management pages

- `/components` - React components
  - `/ui` - Reusable UI components (shadcn/ui based)
  - `/rag` - RAG-specific components (ChatWindow, FileUpload, etc.)
  - `/behavior` - Behavior editor components
  - `/docs` - Document management components

- `/lib` - Core utilities and business logic
  - `store.ts` - Zustand store with project/component management
  - `types.ts` - TypeScript type definitions

- `/utils` - Helper utilities
  - `cn.ts` - Class name utility for Tailwind

### Key Features

1. **Project Management**: Create and manage projects with board selection, component tracking, and pin assignments
2. **RAG Integration**: Chat interface with document retrieval using Supabase vector store and LangChain agents
3. **Component System**: Track hardware components with pin assignments and power budgets
4. **Behavior DSL**: Custom DSL editor for defining component behaviors
5. **Document Management**: Upload and manage project documentation with PDF support

### API Integration Points

- **Supabase**: Used for vector storage in RAG system (requires SUPABASE_URL and SUPABASE_PRIVATE_KEY env vars)
- **OpenAI**: Powers embeddings and chat functionality (requires OPENAI_API_KEY env var)

### State Management

The application uses Zustand with persistence for managing:
- Projects (with components, assignments, behavior DSL)
- UI state (particles toggle)
- Component instances and pin assignments

The store is persisted to localStorage under the key "zettasource-store".