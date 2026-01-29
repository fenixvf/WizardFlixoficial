# Wizard Flix - Anime Streaming Platform

## Overview

Wizard Flix is a magical-themed anime streaming platform built with React and Express. It allows users to browse trending anime content, search for specific titles, view details, and maintain a personal "Grimoire" (favorites list). The application integrates with TMDB (The Movie Database) API for content data and uses an embedded player for streaming.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui components
- **Animations**: Framer Motion for UI transitions
- **Build Tool**: Vite

The frontend follows a page-based structure with reusable components. Key pages include Home (trending content with hero carousel), Search, Details, Watch (embedded player), Grimoire (favorites), and Genres.

### Backend Architecture
- **Framework**: Express 5 on Node.js
- **API Design**: RESTful endpoints prefixed with `/api`
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Session Management**: Express sessions (configured for pg-simple)

The server handles authentication, favorites management, and proxies requests to the TMDB API. Routes are defined in `server/routes.ts` with type-safe schemas in `shared/routes.ts`.

### Shared Code Pattern
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts`: Drizzle table definitions and Zod validation schemas
- `routes.ts`: API route definitions with input/output schemas

### Database Schema
Two main tables:
- **users**: id, username, password, avatarUrl, createdAt
- **favorites**: id, userId, tmdbId, type (movie/tv), title, posterPath, addedAt

### Authentication Flow
Simple username/password authentication with session-based auth. No external OAuth providers. Passwords should be hashed before storage (implementation detail in routes).

### Design Theme
The application uses a dark, magical RPG theme with:
- Purple primary color (#8B5CF6)
- Black background with gradient overlays
- Custom fonts: MedievalSharp for headings, DM Sans for body text
- Glow effects and smooth animations

## External Dependencies

### Third-Party APIs
- **TMDB API**: The Movie Database API for all content data (trending, search, details). Requires `TMDB_API_KEY` environment variable. Responses are in Portuguese (pt-BR).

### Embedded Player
- **PlayerFlixAPI**: External streaming service used via iframe embeds at `playerflixapi.com` for movie and TV episode playback.

### Database
- **PostgreSQL**: Required for user data and favorites. Connection via `DATABASE_URL` environment variable.

### Key NPM Packages
- `drizzle-orm` + `drizzle-kit`: Database ORM and migrations
- `@tanstack/react-query`: Server state management
- `framer-motion`: Animation library
- `wouter`: Client-side routing
- `zod`: Schema validation
- `shadcn/ui` components via Radix primitives